#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <MQTT.h>
#include <ArduinoJson.h>
#include <time.h>
#include "sensor.h"
#include "leds.h"
#include "servofan.h"
#define emptyString String()
// NodeMCU sensor pin definition
// Error handling functions
#include "errors.h"
// Configuration data
#include "configuration.h"
//#include "leds.h"

// Define MQTT port
const int MQTT_PORT = 8883;
// Define subscription and publication topics (on thing shadow)
byte mac[6];
const char MQTT_SUB_TOPIC[] = "$aws/things/" THINGNAME "/shadow";
const char MQTT_PUB_TOPIC[] = "$aws/things/" THINGNAME "/shadow";
//topic per l'invio dei dati dal sensore
const char MQTT_PUB_TOPIC_SENSORS[] = "$aws/things/" THINGNAME "/shadow/name/sensors";
const char MQTT_SUB_TOPIC_SENSORS[] = "$aws/things/" THINGNAME "/shadow/name/sensors";
//topic per l'invio dei comandi dalla webapp
const char MQTT_PUB_TOPIC_ALERTS[] = "$aws/things/" THINGNAME "/shadow/name/alerts";
const char MQTT_SUB_TOPIC_ALERTS[] = "$aws/things/" THINGNAME "/shadow/name/alerts";
// Enable or disable summer-time
#ifdef USE_SUMMER_TIME_DST
uint8_t DST = 1;
#else
uint8_t DST = 0;
#endif

// Create Transport Layer Security (TLS) connection
WiFiClientSecure net;

// Load certificates
BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey key(privkey);
// Initialize MQTT client
MQTTClient client;
unsigned long lastMs = 0;
time_t now;
time_t nowish = 1510592825;
unsigned long previousMillis = 0;
const long interval = 5000;

String gettime(){
  struct tm timeinfo;
  now = time(nullptr);
  // put your main code here, to run repeatedly:
  gmtime_r(&now, &timeinfo); 
  String y = String(timeinfo.tm_year);
  String m = String(timeinfo.tm_mon);
  String h = String(timeinfo.tm_hour);
  String mn = String(timeinfo.tm_min);
  String s = String(timeinfo.tm_sec);
  String final =y+m+h+mn+s;
  return final;
}
// Get time through Simple Network Time Protocol
void NTPConnect(void)
{
 Serial.print("Setting time using SNTP");
 configTime(TIME_ZONE * 3600, DST * 3600, "pool.ntp.org", "time.nist.gov");
 now = time(nullptr);
 while (now < nowish)
 {
 delay(500);
 Serial.print(".");
 now = time(nullptr);
 }
 Serial.println("done!");
 struct tm timeinfo;
 gmtime_r(&now, &timeinfo);
 Serial.print("Current time: ");
 Serial.print(asctime(&timeinfo));
}

//funzione per gestire i payload che arrivano dal topic alert
void gestioneAlertdaWebapp(String &payload){
  String inputString = payload;
  StaticJsonDocument<300> jsonDocument;
  DeserializationError error = deserializeJson(jsonDocument, inputString);
  if (error) {
    Serial.println("Errore durante il parsing JSON");
  } else {
    String message = jsonDocument["message"].as<String>();
    Serial.println(message);
    if(message == "soglia_estiva"){
      enableEst();
    }else if(message == "soglia_invernale"){
      enableInv();
    }else if(message=="soglia_custom"){
      float t = jsonDocument["temp"].as<float>();
      float h = jsonDocument["hum"].as<float>();
      enableCustom(h,t);
    }else if(message=="start_fan"){
      Serial.println("start_fan");
      keep = true;
      play = true;
      r.actfan = true;
      r.actmode = true;
    }else if(message=="stop_fan"){
      Serial.println("stop_fan");
      keep = true;
      play = false;
      r.actmode = true;
      r.actfan = false;
    }else if(message=="auto_fan"){
      Serial.println("auto_fan");
      r.actmode = false;
      keep = false;
    }
    else if(message=="manu_fan"){
      Serial.println("manual_fan");
      r.actmode = true;
      keep = true;
    }
    else{
      Serial.println("Messaggio nel topic che non indica un comando:");
      Serial.println(payload);
    }
  }
}

// MQTT management of incoming messages
void messageReceived(String &topic, String &payload)
{
 if(topic == "$aws/things/" THINGNAME "/shadow/name/alerts"){
   gestioneAlertdaWebapp(payload);
 }
 //Serial.println("Received [" + topic + "]: " + payload);
}
// MQTT Broker connection
void connectToMqtt(bool nonBlocking = false)
{
 Serial.print("MQTT connecting ");
 while (!client.connected())
 {
 if (client.connect(THINGNAME))
 { Serial.println("connected!");
 if (!client.subscribe(MQTT_SUB_TOPIC) || !client.subscribe(MQTT_SUB_TOPIC_SENSORS) || !client.subscribe(MQTT_SUB_TOPIC_ALERTS))
 lwMQTTErr(client.lastError()); }
 else
 { Serial.print("SSL Error Code: ");
 Serial.println(net.getLastSSLError());
 Serial.print("failed, reason -> ");
 lwMQTTErrConnection(client.returnCode());
 if (!nonBlocking) {
 Serial.println(" < try again in 5 seconds");
 delay(5000);
 }
 else { Serial.println(" <"); }
 }
 if (nonBlocking) break;
 }
}
// Wi-Fi connection
void connectToWiFi(String init_str)
{
 if (init_str != emptyString)
 Serial.print(init_str);
 while (WiFi.status() != WL_CONNECTED)
 {
 Serial.print(".");
 delay(1000);
 }
 if (init_str != emptyString)
 Serial.println("ok!");
}
void verifyWiFiAndMQTT(void)
{
 connectToWiFi("Checking WiFi");
 connectToMqtt();
}
void sendDatas(float t, float h){
  DynamicJsonDocument jsonBuffer(JSON_OBJECT_SIZE(5) + 200);
 JsonObject root = jsonBuffer.to<JsonObject>();
//  JsonObject statesensor = root.createNestedObject("state sensor");
//  JsonObject state_reporteds = statesensor.createNestedObject("reported");
//  state_reporteds["temperature"] = t;
//  state_reporteds["humidity"] = h;
 root["timestamp"] = gettime(); 
 root["reported"] = String(t)+ "C°" + String(h) + "%";
 Serial.printf("Sending [%s]: ", MQTT_PUB_TOPIC_SENSORS);
 serializeJson(root, Serial);
 Serial.println();
 char shadow[measureJson(root) + 1];
 serializeJson(root, shadow, sizeof(shadow));
 if (!client.publish(MQTT_PUB_TOPIC_SENSORS, shadow, false, 0))
 lwMQTTErr(client.lastError());
}
void sendDataa(bool mode, bool fan, int soglia){
  DynamicJsonDocument jsonBuffer(JSON_OBJECT_SIZE(5) + 200);
 JsonObject root = jsonBuffer.to<JsonObject>();
 if(!mode){
 root["automatic"] = "true";
 }else{
   root["automatic"] = "false";
 }
 if(fan){
 root["on"] = "true";
 }else{
   root["on"] = "false";
 }
 root["soglia"] = soglia;
 Serial.printf("Sending [%s]: ", MQTT_PUB_TOPIC_ALERTS);
 serializeJson(root, Serial);
 Serial.println();
 char shadow[measureJson(root) + 1];
 serializeJson(root, shadow, sizeof(shadow));
 if (!client.publish(MQTT_PUB_TOPIC_ALERTS, shadow, false, 0))
 lwMQTTErr(client.lastError());
}

void getName(){
  delay(100);
  Serial.println();
  Serial.print("MAC: ");
  Serial.println(WiFi.macAddress());
  delay(100);
}
