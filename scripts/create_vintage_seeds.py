import json
import os

cameras = [
    {
        "id": "canon-ixy-digital-50",
        "slug": "canon-ixy-digital-50",
        "brand": "Canon",
        "model": "IXY Digital 50",
        "imageUrl": "",
        "priceMsrp": 350000,
        "weightGrams": 130,
        "dimensions": "86 x 53 x 21 mm",
        "specs": {
            "type": "Ultracompact",
            "megapixels": 4.0,
            "sensorSize": "1/2.5-inch",
            "sensorType": "CCD",
            "iso": "Auto, 50, 100, 200, 400",
            "focalLengthEquiv": "35–105 mm",
            "maxAperture": "F2.8–4.9",
            "screenSize": "2.0\"",
            "screenDots": 118000,
            "maxVideoRes": "640 x 480",
            "storageTypes": "SD",
            "battery": "NB-4L Lithium-ion"
        }
    },
    {
        "id": "sony-cyber-shot-dsc-t7",
        "slug": "sony-cyber-shot-dsc-t7",
        "brand": "Sony",
        "model": "Cyber-shot DSC-T7",
        "imageUrl": "",
        "priceMsrp": 420000,
        "weightGrams": 114,
        "dimensions": "92 x 60 x 15 mm",
        "specs": {
            "type": "Ultracompact",
            "megapixels": 5.1,
            "sensorSize": "1/2.5-inch",
            "sensorType": "CCD",
            "iso": "Auto, 100, 200, 400",
            "focalLengthEquiv": "38–114 mm",
            "maxAperture": "F3.5–4.4",
            "screenSize": "2.5\"",
            "screenDots": 230000,
            "maxVideoRes": "640 x 480",
            "storageTypes": "Memory Stick Duo",
            "battery": "NP-FE1 Lithium-ion"
        }
    },
    {
        "id": "kodak-easyshare-c875",
        "slug": "kodak-easyshare-c875",
        "brand": "Kodak",
        "model": "EasyShare C875",
        "imageUrl": "",
        "priceMsrp": 299000,
        "weightGrams": 177,
        "dimensions": "91 x 63 x 32 mm",
        "specs": {
            "type": "Compact",
            "megapixels": 8.0,
            "sensorSize": "1/1.8-inch",
            "sensorType": "CCD",
            "iso": "Auto, 64, 100, 200, 400, 800",
            "focalLengthEquiv": "37–185 mm",
            "maxAperture": "F2.8–4.4",
            "screenSize": "2.5\"",
            "screenDots": 115000,
            "maxVideoRes": "640 x 480",
            "storageTypes": "SD, Internal",
            "battery": "AA batteries"
        }
    },
    {
        "id": "fujifilm-finepix-f31fd",
        "slug": "fujifilm-finepix-f31fd",
        "brand": "Fujifilm",
        "model": "FinePix F31fd",
        "imageUrl": "",
        "priceMsrp": 390000,
        "weightGrams": 155,
        "dimensions": "93 x 57 x 28 mm",
        "specs": {
            "type": "Compact",
            "megapixels": 6.3,
            "sensorSize": "1/1.7-inch",
            "sensorType": "Super CCD HR",
            "iso": "Auto, 100, 200, 400, 800, 1600, 3200",
            "focalLengthEquiv": "36–108 mm",
            "maxAperture": "F2.8–5.0",
            "screenSize": "2.5\"",
            "screenDots": 230000,
            "maxVideoRes": "640 x 480",
            "storageTypes": "xD-Picture Card",
            "battery": "NP-95 Lithium-ion"
        }
    },
    {
        "id": "sony-cyber-shot-dsc-s30",
        "slug": "sony-cyber-shot-dsc-s30",
        "brand": "Sony",
        "model": "Cyber-shot DSC-S30",
        "imageUrl": "",
        "priceMsrp": 450000,
        "weightGrams": 240,
        "dimensions": "115 x 71 x 55 mm",
        "specs": {
            "type": "Compact",
            "megapixels": 1.3,
            "sensorSize": "1/2.7-inch",
            "sensorType": "CCD",
            "iso": "100",
            "focalLengthEquiv": "39–117 mm",
            "maxAperture": "F2.8",
            "screenSize": "2.0\"",
            "screenDots": 122000,
            "maxVideoRes": "320 x 240",
            "storageTypes": "Memory Stick",
            "battery": "NP-FM50 Lithium-ion"
        }
    }
]

os.makedirs("data/seeds", exist_ok=True)
for cam in cameras:
    with open(f"data/seeds/{cam['slug']}.json", "w", encoding="utf-8") as f:
        json.dump(cam, f, indent=2, ensure_ascii=False)
    print(f"Created data/seeds/{cam['slug']}.json")

