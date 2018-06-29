# cryptometrics-dumper
  <b>This is an open source CLI program, written in nodejs, for any crypto investor, data scientist, journalist, and student looking for datasets.</b></br>
  </br>Download datasets with cryptocurrency history in csv or json format, cleaned and updated every day, and calculate the daily change, close off high and volatility to build machine learning models and make financial graphs.</br>
  Data provided by https://coinmarketcap.com.</br>
  Currency in USD.

## Getting Started

### Prerequisites

To use this tool, you must install nodejs and npm, go to https://nodejs.org/en/download/

### Installing

1- Git clone this repository :

```
git clone https://github.com/tmahiddini/cryptometrics-dumper
```

2- Change the current folder, for the new cloned folder :

```
cd cryptometrics-dumper
```

3- install the dependencies :

```
npm update
```

## Running Example :

### Select datasets by crypto currency label :
Download datasets of crypto currency that have the labels BTC ETH XRP BCH :
```
node cryptometrics-dumper.js -l BTC ETH XRP BCH
```
Download datasets of crypto currency that have the labels ETH since January 1, 2016 :
```
node cryptometrics-dumper.js -l ETH --start 2016/01/01
```
Download datasets of crypto currency that have the labels ETH until January 1, 2017 :
```
node cryptometrics-dumper.js -l ETH --end 2017/01/01
```
Download datasets of crypto currency that have the labels ETH,</br> since January 1, 2016, until January 1, 2017,</br> export it in JSON format, and save it to the folder "/tmp/Dataset2016" :
```
node cryptometrics-dumper.js -l ETH --start 2016/01/01 --end 2017/01/01 -o json -F /tmp/Dataset2016
```
### Select datasets by the top of market capitalization :
Get the top 100 by market capitalisation :  
```
node cryptometrics-dumper.js -t 100 -F /tmp/top100
```
Get the top 5 + the labels that have been selected :
```
node cryptometrics-dumper.js -t 5 -l DASH
```
Get the top 5 + the labels that have been selected in a date range that was selected :
```
node cryptometrics-dumper.js -t 5 -l DASH -s 2016/01/01 -e 2017/01/01 -F /tmp/top5_2017
```

### Download history for all crypto currency :
```
cryptometrics-dumper -a
```

## Built With

* [Node.js](https://nodejs.org/) - JavaScript run-time environment that executes JavaScript code server-side.
* [NPM](https://www.npmjs.com/) - Dependency Management - The Node Package Manager.

## Author

* **Mahiddini Thibaut** 

## Donation
If you find this tool useful, please donate :</br>
<b>XBT :</b> 
```
3PMtnSpagRGpD1NTAKDBhJoWp7AmfyvSVa
```
<b>ETH :</b>
```
0xE3Fd3C3b89766E2fc03b03Dfd466a520CB8e3A08
```


