#define red D8
#define green D3

//inizializza i led
void initializeLeds(){
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
}

//accende il led verde
void statusok_led(){
  digitalWrite(green, HIGH);
  digitalWrite(red, LOW);
}

//accede il led rosso
void statusbad_led(){
  digitalWrite(red, HIGH);
  digitalWrite(green, LOW);
}

//test dei leds
void test_leds(){
  digitalWrite(green, HIGH);
  digitalWrite(red, LOW);
  delay(500);
  digitalWrite(green, LOW);
  digitalWrite(red, HIGH);
  delay(500);
    digitalWrite(green, HIGH);
  digitalWrite(red, LOW);
  delay(500);
  digitalWrite(green, LOW);
  digitalWrite(red, HIGH);
  delay(500);
  digitalWrite(red,LOW);
  }