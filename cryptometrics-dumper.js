"use strict"
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var jsonexport = require('jsonexport');
//------------------------------------------------------------------------------------------------------------//
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const optionDefinitions = [
  {name: 'label', alias: 'l', type: String, multiple: true},
  {name: 'get_top', alias: 't', type: Number, multiple : false},
  {name: 'dump_all', alias: 'a', type: Boolean, multiple: false },
  {name: 'start', alias : 's', type: String, multiple : false},
  {name: 'end', alias : 'e', type: String, multiple : false},
  {name: 'Folder', alias: 'F', type: String, multiple: false},
  {name: 'output_file_format', alias: 'o', type: String, multiple: false},
  {name : 'help', alias: 'h', type: Boolean}
];
//------------------------------------------------------------------------------------------------------------//
const sections = [
  {
    header: 'cryptometrics-dumper',
    content: 'Download datasets with cryptocurrency history in csv or json format, clean and updated every day, and calculate the daily change, close off high and volatility to build machine learning models and make financial charts.\nData provided by https://coinmarketcap.com.\n Currency in USD.\nAuthor : Mahiddini Thibaut'
  },
  {
    header: 'Example :',
    content: '{underline Select datasets by crypto currency label:}\n $>cryptometrics-dumper -l BTC ETH XRP BCH\n$>cryptometrics-dumper -l BTC ETH XRP --start 2016/01/01\n$>cryptometrics-dumper -l BTC ETH XRP --end 2017/01/01\n$>cryptometrics-dumper -l BTC ETH XRP --start 2016/01/01 --end 2017/01/01\n\n{underline Select datasets by the top of market capitalization:}\n$>cryptometrics-dumper -t 100 -F /tmp/top100 -o json\n$>cryptometrics-dumper -t 5 -l DASH ZEC -s 2016/01/01 -e 2017/01/01\n\n{underline Download history for all crypto currency:}\n$>cryptometrics-dumper -a'
  },
  {
    header: 'Options :',
    optionList: [
      {
        name: 'label',
        alias: 'l',
        typeLabel: '"BTC ETH XRP"',
        description: 'Label of any cryptocurrency you want to download.\n'
      },
      {
        name: 'get_top',
        alias: 't',
        typeLabel: '{underline int}',
        description: 'Download the top {underline int} cryptocurrency by Market Capitalization.\n'
      },
      {
        name: 'dump_all',
        alias: 'a',
        description: 'Download all crypto currency that are referenced in the database.\n'
      },
      {
        name: 'start',
        alias: 's',
        typeLabel: '"yyyy/mm/dd"',
        description: 'Start date of the datasets, by default the date of departure is the launch date of the cryptocurrency.\n{underline Format :}\n--start yyyy/mm/dd\n--start yyyy-mm-dd\n--start yyyymmdd\n'
      },
      {
        name: 'end',
        alias: 'e',
        typeLabel: '"yyyy/mm/dd"',
        description : 'End date of the datasets, by default the end date is today\'s date.\n{underline Format :}\n--end yyyy/mm/dd\n--end yyyy-mm-dd\n--end yyyymmdd\n'
      },
      {
        name: 'Folder',
        alias: 'F',
        typeLabel: '"PATH"',
        description: 'Path of the folder where you want to save your datasets, by default the datasets will be saved in the data/ folder.\nNote : This option is disable for Windows platform.\n'
      },
      {
        name: 'output_file_format',
        alias: 'o',
        typeLabel: '"json"',
        description: 'The format in which you want to export your datasets, by default "csv" is select.\n'
      },
      {
        name: 'help',
        alias: 'h',
        description: 'Print this usage guide.'
      }
    ]
  }
]
const usage = commandLineUsage(sections);
const options = commandLineArgs(optionDefinitions);
//------------------------------------------------------------------------------------------------------------//
var status = '\nSTATUS : The program is running, please wait ..';
var warning_status = '\nSTATUS : This warning does not stop the program. The program is running, please wait ..';
var more_info = '\nINFO : For more information --> cryptometrics-dumper --help';
//------------------------------------------------------------------------------------------------------------//
if (options.label == undefined && options.get_top == undefined && options.dump_all == undefined || options.help == true){
  console.log(usage);
  return;
}
//------------------------------------------------------------------------------------------------------------//
var regex_top = /^[0-9]{1,}$/;
if(options.get_top != undefined){
  if(!regex_top.test(options.get_top)){
    console.log("ERROR : The get_top option is incorrect !" + more_info);
    return;
  }
  else {options.get_top = parseInt(options.get_top);}
}
//------------------------------------------------------------------------------------------------------------//
if(options.dump_all == true){
  if(options.label != undefined){
    options.label = undefined;
    console.log('WARNING : The selections by "label" option has been disabled because the whole database will be downloaded !' + warning_status);
  }
  if(options.get_top != undefined){
    options.get_top = undefined;
    console.log('WARNING : The selections options by "top" has been disabled because the whole database will be downloaded !' + warning_status);
  }
}
//------------------------------------------------------------------------------------------------------------//
var regex_date = /^[0-9]{8}$/;
if(options.start == undefined) options.start = '20000101';
if (options.end == undefined){
  var date = new Date();
  date.setTime(new Date().getTime());
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if (day < 10) day = '0'+ day;
  if (month < 10) month = '0' + month;
  options.end = year+month+day;
}

if (options.start != undefined){
  options.start = options.start.replace(/\/|-/g,'');
  if(regex_date.test(options.start) == false){
    console.log("ERROR : The start date is incorrect !"+more_info);
    return;
  }
}

if(options.end != undefined){
  options.end = options.end.replace(/\/|-/g,'');
  if(regex_date.test(options.end) == false){
    console.log("ERROR : The end date is incorrect !"+more_info);
    return;
  }
}
var historical_url = 'historical-data/?start='+options.start+'&end='+options.end;
//------------------------------------------------------------------------------------------------------------//
if(options.Folder != undefined && process.platform =='win-32'){
  console.log('ERROR : Option "--Folder" is disable for windows platform !\nINFO : By default the datasets will be saved in the data/ folder'+more_info);
  return;
}
var Folder = set_Folder(process.platform, options.Folder);
//------------------------------------------------------------------------------------------------------------//
var output_format = 'csv';
if (options.output_file_format != undefined){
  if (options.output_file_format != 'json' && options.output_file_format != 'csv'){
      console.log('ERROR : Error while writing the output format !'+more_info);
      return;
  }
  else {
    output_format = options.output_file_format;
  }
}
//------------------------------------------------------------------------------------------------------------//
function create_folder_with_path_verification (path){
  if (!fs.existsSync(path)) {
    fs.mkdir(path, function (err) {
      if (err)
        console.log('ERROR : Failed to create directory --> ' + path);
      else
        console.log("INFO : Folder created, the data will be saved in the folder --> " + path + '.'+status);
    });
  }
  else{
    console.log("INFO : The data will be saved in the folder --> " + path + '.'+status);
  }
}
//------------------------------------------------------------------------------------------------------------//
function set_Folder (platform, Folder = undefined){
  if(platform == 'win-32'){
    if (Folder == undefined) {
      Folder = 'data/';
      create_folder_with_path_verification(Folder);
    }
  }
  else{
    if (Folder == undefined){
      Folder = 'data/';
      create_folder_with_path_verification(Folder);
    }
    else{
      Folder = Folder.replace(/\/$/,'');
      Folder += '/';
      create_folder_with_path_verification(Folder);
    }
  }
  return Folder;
}
//------------------------------------------------------------------------------------------------------------//
select_dataset (function(url, label){
  if (options.label != undefined){
    for (var i = 0; i < options.label.length; i++)
      select_data_with_crypto_label(options.label[i]);
  }

  if(options.get_top != undefined){
    get_top(options.get_top);
  }

  if(options.dump_all == true){
    dump_all();
  }

  function select_data_with_crypto_label (selected_label){
    var flag = false;
    for (var i = 0; i < label.length; i++){
      if (label[i] == selected_label){
        flag = true;
        coin_market_cap_scraper(url[i] + historical_url, label[i], output_format);
      }
      if (i == label.length - 1 && label[i] != selected_label && flag == false){
        console.log('WARNING : No cryptocurrency with the "'+selected_label+'" label was found in the database !' + warning_status);
      }
    }
  }

  function get_top (top){
    for (var i = 0; i < top; i++)
      coin_market_cap_scraper(url[i] + historical_url, label[i], output_format);
  }

  function dump_all(){
    for (var i = 0; i < label.length; i++)
        coin_market_cap_scraper(url[i] + historical_url, label[i], output_format);
  }

});
//------------------------------------------------------------------------------------------------------------//
function select_dataset (next){
  (function get_url_and_label(){
    try {
      var website_url = 'https://coinmarketcap.com';
      var url = [];
      var label = [];
      request('https://coinmarketcap.com/all/views/all/', function(error, response, html){
        if (html == undefined) return get_url_and_label();
        var $ = cheerio.load(html);
        $('tbody td:nth-child(2) span a').filter(function(){
          var data = $(this);
          url.push(website_url + data[0].attribs.href);
        });

        $('tbody .col-symbol').filter(function(){
          var data = $(this);
          label.push(data[0].children[0].data);
        });
        next(url, label);
      });
    } catch (e) {
        console.log("ERROR : Error while executing the request !");
        console.log('Erreur : ' + e.stack);
        console.log('Erreur : ' + e.message);
        console.trace();
      }
  })();
}
//------------------------------------------------------------------------------------------------------------//
function coin_market_cap_scraper (url, label, output_format){
  try {
    var tmp_array = [];
    var serialiaze_array = [];
    var output_file = label;
    var start_date = '';
    var end_date = '';

    request(url, function(error, response, html){
      if (html == undefined){
        if(label == undefined | label == "") return;
        return coin_market_cap_scraper(url, label, output_format);
      }
      var $ = cheerio.load(html);
      var date = [];
      var open = [];
      var high = [];
      var low = [];
      var close = [];
      var volume = [];
      var market_cap = [];
      var change;
      var close_off_high;
      var volatility;

      function SerializeObject (date, open, high, low, close, volume, market_cap, change, close_off_high, volatility){
        this.date = date;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
        this.market_cap = market_cap;
        this.change = change;
        this.close_off_high = close_off_high;
        this.volatility = volatility;
      }

      $('.table tbody .text-left').filter(function(){
        var data = $(this);
        var date_obj = new Date (data.text());
        var day = date_obj.getDate();
        var month = date_obj.getMonth() + 1;
        var year = date_obj.getFullYear();
        if (day < 10) day = '0'+ day;
        if (month < 10) month = '0' + month;
        var parsed_date = (year+ '-' +month+ '-' +day);
        date.push(parsed_date);
      });

      $('.table tbody tr td').filter(function(){
        var data = $(this);
        tmp_array.push(data[0].attribs['data-format-value']);
      });

      for (var i = 0; i < tmp_array.length; i++){
        if (tmp_array[i] == "-") tmp_array[i] = 0;
        var value = parseFloat(tmp_array[i]);
        if (i % 7 == 1) open.push(value);
        if (i % 7 == 2) high.push(value);
        if (i % 7 == 3) low.push(value);
        if (i % 7 == 4) close.push(value);
        if (i % 7 == 5) volume.push(value);
        if (i % 7 == 6) market_cap.push(value);
      }

      for (var j = 0; j < date.length; j++){
        if (j == 0) end_date = date[j];
        if (j == date.length -1) start_date = date[j];
        change = (close [j] - open [j]) / open [j];
        close_off_high = 2 * (high [j] - close [j]) / (high [j] - low [j]) - 1;
        volatility = (high[j] - low [j]) / open [j];
        var serialiaze_object = new SerializeObject (date[j], open[j], high[j], low[j], close[j], volume[j], market_cap[j], change, close_off_high, volatility);
        serialiaze_array.push(serialiaze_object);
      }

      if (serialiaze_array.length > 0){
        if (output_format == 'csv') {
          jsonexport(serialiaze_array ,function(err, csv){
            if(err) return console.log(err);
            try {
                fs.writeFileSync(Folder+output_file+'_historic_'+start_date+'_'+end_date+'.'+output_format, csv, "UTF-8");
                console.log('INFO : File successfully written ! - Check directory '+Folder+' for --> '+output_file+'_historic_'+start_date+'_'+end_date+'.'+output_format);
            } catch (err) {
              console.log('Error writing : '+Folder+output_file+'_historic_'+start_date+'_'+end_date+'.'+output_format+'\n'+ err.message);
            }
          });
        }

        if (output_format == 'json'){
          try {
              fs.writeFileSync(Folder+output_file+'_historic_'+start_date+'_'+end_date+'.'+output_format, JSON.stringify(serialiaze_array, null, 4),"UTF-8");
              console.log('INFO : File successfully written ! - Check directory '+Folder+' for --> '+output_file+'_historic_'+start_date+'_'+end_date+'.'+output_format);
          } catch (err) {
            console.log('Error writing : '+Folder+output_file+'_historic_'+start_date+'_'+end_date+'.'+output_format+'\n'+ err.message);
          }
        }
      }
      else{
        console.log('WARNING : No dataset avalaible for "'+label+'" !' + warning_status);
      }
    });
  } catch (e) {
      console.log("ERROR : Error while executing the request !");
      console.log('Erreur : ' + e.stack);
      console.log('Erreur : ' + e.message);
      console.trace();
    }
}
