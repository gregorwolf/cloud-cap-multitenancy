// Direct access via Synonyms can't be used as this results in a duplicate definition
// which is caused by the fact that for the mtx build no models can be specified:
/*
        {
          "for": "mtx",
          "src": ".",
          "dest": "srv",
          "options": {
            "model": [
              "db",
              "srv"
            ]
          }
        }
*/
/*
[ERROR] db/common-data-model.cds:5:8-18: Duplicate definition of artifact "common.Currencies" (in entity:"common.Currencies")
[ERROR] db_comm/data-model.cds:10:8-18: Duplicate definition of artifact "common.Currencies" (in entity:"common.Currencies")
[ERROR] db/common-data-model.cds:14:8-14: Duplicate definition of artifact "common.States" (in entity:"common.States")
[ERROR] db_comm/data-model.cds:4:8-14: Duplicate definition of artifact "common.States" (in entity:"common.States")
*/
/*
namespace common;

// Access directly via Synonym
@cds.persistence.exists
entity Currencies {
  key code : String(3);
  name     : String(128);
  UperUSD  : Double;
  USDperU  : Double;
}

// Access directly via Synonym
@cds.persistence.exists
entity States {
  key code : String(2);
  abbrev   : String(6);
  name     : String(24);
}
*/