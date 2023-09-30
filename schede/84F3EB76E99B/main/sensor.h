#include <DHT.h>
#define DHTPIN D7
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

//Struttura per la soglia
typedef struct{
  float temp;
  float hum;
  bool is;
} Soglia;

//le tre soglie possibili
Soglia soglia_invernale;
Soglia soglia_estiva;
Soglia soglia_custom;

//inizializzazione del sensore dht e delle soglie, di default attiva la soglia estiva
void initializeSensors(){
dht.begin();
soglia_invernale.temp = 22.0;
soglia_invernale.hum = 50.0;
soglia_invernale.is = false;
soglia_estiva.temp = 26.0;
soglia_estiva.hum = 60.0;
soglia_estiva.is = true;
soglia_custom.is = false;
}

//restituisce un valore in base alla soglia attiva
int getActualSoglia(){
  if(soglia_estiva.is){
    return 0;
  }
  else if(soglia_invernale.is){
    return 1;
  }
  else if(soglia_custom.is){
    return 2;
  }else{
    return -1;
  }
}

//attiva la soglia invernale
void enableInv(){
  soglia_invernale.is = true;
  soglia_estiva.is = false;
  soglia_custom.is = false;
  Serial.println("Soglia invernale enabled");
}

//attiva la soglia estiva
void enableEst(){
  soglia_estiva.is = true;
  soglia_invernale.is = false;
  soglia_custom.is = false;
  Serial.println("Soglia estiva enabled");
}

//attiva la soglia custom
void enableCustom(float h, float t){
  soglia_custom.is = true;
  soglia_custom.temp = t;
  soglia_custom.hum = h;
  soglia_estiva.is = false;
  soglia_invernale.is = false;
  Serial.println("Soglia custom enabled");
}

//verifica se le condizioni della stanza sono ottimali in base alla soglia
//in input h l'umidità e t la temperatura
bool checkSoglie(float h, float t){
  if(soglia_invernale.is){
    if(h<=soglia_invernale.hum && t<=soglia_invernale.temp){
      Serial.println("minore della soglia");
      return true;
    }
    else{
      Serial.println("maggiore della soglia");
      return false;
    }
  }
  else if(soglia_estiva.is){
    if(h<=soglia_estiva.hum && t<=soglia_estiva.temp){
      //Serial.println("minore della soglia");
      return true;
    }
    else{
      //Serial.println("maggiore della soglia");
      return false;
    }
  }
  else if(soglia_custom.is){
    if(h<=soglia_custom.hum && t<=soglia_custom.temp){
      return true;
    }
    else{
      return false;
    }
  }
  return false;
}

//Restituisce il valore dell'umidità attuale
float hum(){
  float humidity;  
  humidity = dht.readHumidity();
  if (isnan(humidity)) {
    Serial.println("Errore nella lettura del sensore di temperatura e umidità");
    return 0.0;
  }
  delay(100);
  return humidity;
}
//Restituisce il valore della temperatura attuale
float tem(){
  float temperature;
  temperature = dht.readTemperature();
  if (isnan(temperature)) {
    Serial.println("Errore nella lettura del sensore di temperatura e umidità");
    return 0.0;
  }
  delay(100);
  return temperature;
}
