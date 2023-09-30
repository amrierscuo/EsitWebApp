#include <pgmspace.h>
const char ssid[] = "XXXXXX";
const char pass[] = "XXXXXX";

const char ssid1[] = "XXXXXX";
const char pass1[] = "XXXXXX";

#define THINGNAME "84:F3:EB:76:E9:9B"

int8_t TIME_ZONE = +1; //ITALY +1 UTC
#define USE_SUMMER_TIME_DST
const char MQTT_HOST[] = "XXXXXX";
typedef struct{
  float acttemp;
  float acthum;
  int actsoglia;
  bool actmode;
  bool actfan;
  bool actstate;
}StatusRoom;
StatusRoom r;
// Copy contents from AWS CA certificate here ▼
static const char cacert[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
XXXXXX
-----END CERTIFICATE-----
)EOF";

// Copy contents from XXXXXXXX-certificate.pem.crt here ▼
static const char client_cert[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
XXXXXX
-----END CERTIFICATE-----
)KEY";
// Copy contents from XXXXXXXX-private.pem.key here ▼
static const char privkey[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
XXXXXX
-----END RSA PRIVATE KEY-----
)KEY";