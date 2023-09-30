#include "connection.h"
#include "display.h"
//CORREGGERE POSIZIONE SHADOW
int avgcount;
float avghum;
float avgtem;
uint8_t GPIO_Pin1 = D6;
uint8_t GPIO_Pin2 = D5;
void ICACHE_RAM_ATTR IntCallback_one();
void ICACHE_RAM_ATTR IntCallback_two();
float sampleSize = 11;
int transmitTime = 10000;

void setup() {
  attachInterrupt(digitalPinToInterrupt(GPIO_Pin1), IntCallback_one, RISING);
  attachInterrupt(digitalPinToInterrupt(GPIO_Pin2), IntCallback_two, RISING);
  Serial.begin(115200);
  setupAll();
  WiFi.hostname(THINGNAME);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  connectToWiFi(String("Trying to connect with SSID: ") + String(ssid));
  NTPConnect();
  net.setTrustAnchors(&cert);
  net.setClientRSACert(&client_crt, &key);
  client.begin(MQTT_HOST, MQTT_PORT, net);
  client.onMessage(messageReceived);
  connectToMqtt();
  delay(500);
  r.actmode = false;
  r.actfan = true;
  delay(1000);
}
void loop() {
  gestioneFun();
  r.actsoglia = getActualSoglia();
  Serial.println(r.actmode);
  Serial.println(r.actsoglia);
  updateDisplay(r.actmode, r.acthum, r.acttemp, r.actsoglia);
  if(avgcount<sampleSize){
      Serial.println("Counter");
      Serial.println(avgcount);
      float humi = hum();
      float temp = tem();
      Serial.println("Acttemp");
      Serial.println(temp);
      avghum = avghum + humi;
      avgtem = avgtem + temp;
      avgcount++;
      delay(500);
  }else if(avgcount == sampleSize){
      Serial.println(avgcount);
        avghum = avghum / (sampleSize+1);
        avgtem = avgtem / (sampleSize+1);
        float ravgtem = round(avgtem * 100) / 100;
        float ravghum = round(avghum * 100) / 100;
        avgcount = 0;
        r.acttemp = ravgtem;
        r.acthum = ravghum;
        delay(500);          
  }
  now = time(nullptr);
  if (!client.connected()) {
    verifyWiFiAndMQTT();
  } else {
    client.loop();
      if (millis() - lastMs > transmitTime) {
      lastMs = millis();
        sendDatas(r.acttemp, r.acthum);
        sendDataa(r.actmode, r.actfan, r.actsoglia);
  }
  startfan();
  delay(500);
}
}
void ICACHE_RAM_ATTR IntCallback_one() {
  Serial.println("start or stop");
  keep = true;
  play = !play;
  r.actmode = true;
  r.actfan = play;
}
void ICACHE_RAM_ATTR IntCallback_two() {
  Serial.println("automatic_mode");
  keep = false;
  r.actmode = false;
}
void gestioneFun() {
  if (checkSoglie(r.acthum, r.acttemp)) {
    statusok_led();
    r.actstate = true;
    if (keep == false) {
      play = false;
      r.actfan = false;
    }
  } else if (!checkSoglie(r.acthum, r.acttemp)) {
    r.actstate = false;
    statusbad_led();
    if (keep == false) {
      play = true;
      r.actfan = true;
    }
  }
}
void setupAll() {
  avgcount = 0;
  avghum = 0;
  avgtem = 0;
  getName();
  initializeLeds();
  initializeServo();
  initializeSensors();
  initializeDisplay();
}

void campionavalori(){
  if(avgcount<sampleSize){
      avgcount++;
      float humi = hum();
      float temp = tem();
      Serial.println(humi);
      Serial.println(temp);
      avghum = avghum + humi;
      avgtem = avgtem + temp;
      delay(200);
  }else{
      Serial.println(avgcount);
        avghum = avghum / (sampleSize+1);
        avgtem = avgtem / (sampleSize+1);
        float ravgtem = round(avgtem * 100) / 100;
        float ravghum = round(avghum * 100) / 100;
        avgcount = 0;
        r.acttemp = ravgtem;
        r.acthum = ravghum;
        delay(200);          
  } 
  delay(100);
}