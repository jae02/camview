import json
import os

def generate_description(camera):
    brand = camera.get("brand", "")
    model = camera.get("model", "")
    body_type = camera.get("bodyType", "").replace("_", " ").title()
    sensor_size = camera.get("sensorSize", "").replace("_", " ").title()
    mp = camera.get("megapixels", 0)
    video = camera.get("maxVideoResolution", "")
    release_date = camera.get("releaseDate", "")
    year = release_date[:4] if release_date else ""
    
    # Translation maps
    body_type_kr = {
        "Dslr": "DSLR",
        "Mirrorless": "미러리스",
        "Compact": "컴팩트",
        "Medium Format": "중형 포맷",
    }.get(body_type, body_type)
    
    sensor_size_kr = {
        "Full Frame": "풀프레임",
        "Aps C": "APS-C (크롭)",
        "Micro Four Thirds": "마이크로 포서드",
        "Medium Format": "중형",
        "One Inch": "1인치",
    }.get(sensor_size, sensor_size)
    
    desc = f"{brand} {model}은(는) "
    if year and year != "1970":
        desc += f"{year}년에 출시된 "
    
    desc += f"{sensor_size_kr} 센서를 탑재한 {body_type_kr} 카메라입니다. "
    
    if mp and mp > 0:
        desc += f"약 {mp}만 화소의 뛰어난 해상도를 제공하며, "
    else:
        desc += f"안정적인 이미지 퀄리티를 제공하며, "
        
    if video and str(video).strip() != "":
        desc += f"최대 {video}급 고해상도 동영상 촬영 기능을 지원합니다. "
        
    ibis = camera.get("imageStabilization", False)
    if ibis:
        desc += "바디 내장형 손떨림 보정(IBIS) 기능이 탑재되어 어두운 환경이나 핸드헬드 촬영 시에도 안정적인 결과물을 얻을 수 있습니다. "
    
    weather = camera.get("weatherSealed", False)
    if weather:
        desc += "방진 방적 구조가 적용되어 다양한 야외 촬영 환경에서도 높은 신뢰성을 발휘합니다. "
        
    pros = camera.get("_prosCons", {}).get("pros", [])
    if isinstance(pros, list) and len(pros) > 0:
        desc += "풍부한 기능과 우수한 스펙 밸런스를 갖추어 사진 촬영은 물론 영상 제작 환경에서도 폭넓게 활용할 수 있는 강력한 성능의 모델입니다."
    else:
        desc += "다양한 촬영 목적에 부합하는 균형 잡힌 기본기를 갖춘 모델입니다."
        
    return desc

def main():
    seeds_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'seeds', 'all_cameras_seed.json')
    
    if not os.path.exists(seeds_path):
        print(f"Error: {seeds_path} not found.")
        return
        
    with open(seeds_path, 'r', encoding='utf-8') as f:
        cameras = json.load(f)
        
    updated_count = 0
    for cam in cameras:
        # Update only if description is null or empty string
        if not cam.get("description"):
            cam["description"] = generate_description(cam)
            updated_count += 1
            
    with open(seeds_path, 'w', encoding='utf-8') as f:
        json.dump(cameras, f, indent=2, ensure_ascii=False)
        
    print(f"Success! Generated and populated descriptions for {updated_count} cameras.")

if __name__ == "__main__":
    main()
