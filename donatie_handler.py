import json
import os

BESTAND = 'donaties.json'

def lees_donaties():
    if os.path.exists(BESTAND):
        with open(BESTAND, 'r') as f:
            return json.load(f)
    
    return {}

def schrijf_donaties(donaties):
    # Sorteer dict op waarde (bedrag), aflopend
    gesorteerd = dict(sorted(donaties.items(), key=lambda item: item[1], reverse=True))
    with open(BESTAND, 'w') as f:
        json.dump(gesorteerd, f, indent=4)

def verwerk_donatie(naam, aantalFotos):
    donaties = lees_donaties()
    if naam in donaties:
        donaties[naam] += aantalFotos
    else:
        donaties[naam] = aantalFotos
    schrijf_donaties(donaties)
