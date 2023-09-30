#include <Servo.h>
#define servopin D4

Servo servo;
//lo stato della variabile play influisce sul funzionamento o no del ventilatore
bool play = false;
//la variabile keep tiene conto della modalità
bool keep = false;

//inizializza il servo
void initializeServo(){
    servo.attach(servopin);    
}

//test iniziale
void test_servo(){
  servo.write(0);
  delay(300);
  servo.write(180);
  delay(300);
  servo.write(0);
  delay(300);
  servo.write(180);
}

//funzione per l'attivazione del servo in base alla variabile play
void startfan(){
  if(play){
    int pos;
    for (pos = 180; pos >= 0; pos -= 20) {
    servo.write(pos);  // Imposta la posizione del servo
    delay(20);  // Attendi un breve periodo di tempo per il movimento
    }
    for (pos = 0; pos <= 180; pos += 20) {
    servo.write(pos);  // Imposta la posizione del servo
    delay(20);  // Attendi un breve periodo di tempo per il movimento
    }
  }
  else{
    return;
  }
}