#include <LiquidCrystal_I2C.h>

// set the LCD number of columns and rows
int lcdColumns = 16;
int lcdRows = 2;
LiquidCrystal_I2C lcd(0x27, lcdColumns,lcdRows);
char message[20]; 
int displaycount = 0;

//Struttura per la scrittura nel display
typedef struct{
  bool autom;
  float temp;
  float hum;
  int soglia;
}DisplayMessages;

DisplayMessages mesg;


//primo messaggio
void message1(){
  lcd.setCursor(0,0);
  lcd.print("Stanza:");
  lcd.setCursor(0,1);
  if(!mesg.autom){
    lcd.print("Automatica");
  }
  else{
    lcd.print("Manuale");
  }
}

//secondo messaggio
void message2(){
  lcd.setCursor(0,0);
  sprintf(message, "Temperatura:%.1f", mesg.temp);  // Formatta il valore float nella stringa
  lcd.print(message);
  lcd.setCursor(0,1);
  sprintf(message, "Umidita': %.1f", mesg.hum);
  lcd.print(message);
}

//terzo messaggio
void message3(){
  lcd.setCursor(0,0);
  lcd.print("Soglia attuale:");
  lcd.setCursor(0,1);
  if(mesg.soglia == 0){
    lcd.print("Estiva");
  }else if(mesg.soglia == 1){
    lcd.print("Invernale");
  }else if(mesg.soglia == 2){
    lcd.print("Custom");
  }
}

//funzione di test iniziale
void testdisplay(){
  lcd.setCursor(0, 0);
  lcd.print("Stanza1");
  lcd.setCursor(0,1);
  lcd.print("Automatica");
  lcd.clear();
  message2();
}

//funzione di inizializzazione del display
void initializeDisplay(){
 lcd.init();
 lcd.backlight();
 lcd.setCursor(0, 0);  
 testdisplay();
 mesg.temp = 0.00;
 mesg.autom = true;
 mesg.hum = 0.00;
}

//funzione per l'update del display, in ingresso lo stato della scheda per l'aggiornamento
//ogni 10 intervalli cambia il messaggio, gli stati vengono aggiornati in tempo reale
void updateDisplay(bool mode, float humidity, float temperature, int soglia){
  mesg.autom = mode;
  mesg.hum = humidity;
  mesg.temp = temperature;
  mesg.soglia = soglia;
  displaycount++;
  lcd.clear();
  if(displaycount>=0 && displaycount<=10){
    message1();
  }else if(displaycount>=10 && displaycount<=20){
    message2();
  } 
  else{
    message3();
    if(displaycount>=30){
      displaycount = 0;
    }
  }
}