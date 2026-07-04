import json
import urllib.request
import sys

URL = "https://porra-mundial-2026-vxcx.onrender.com"

# The real scores of all 66 matches played/completed as of June 27, 2026
scores = {
    1: {"gh": 2, "ga": 0, "penaltyWinner": ""}, # México vs Sudáfrica
    2: {"gh": 2, "ga": 1, "penaltyWinner": ""}, # Corea del Sur vs Rep. Checa
    3: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Canadá vs Bosnia
    4: {"gh": 4, "ga": 1, "penaltyWinner": ""}, # USA vs Paraguay
    5: {"gh": 0, "ga": 1, "penaltyWinner": ""}, # Haití vs Escocia
    6: {"gh": 2, "ga": 0, "penaltyWinner": ""}, # Australia vs Turquía
    7: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Brasil vs Marruecos
    8: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Catar vs Suiza
    9: {"gh": 1, "ga": 0, "penaltyWinner": ""}, # Costa de Marfil vs Ecuador
    10: {"gh": 7, "ga": 1, "penaltyWinner": ""}, # Alemania vs Curazao
    11: {"gh": 2, "ga": 2, "penaltyWinner": ""}, # Países Bajos vs Japón
    12: {"gh": 5, "ga": 1, "penaltyWinner": ""}, # Suecia vs Túnez
    13: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Arabia Saudita vs Uruguay
    14: {"gh": 0, "ga": 0, "penaltyWinner": ""}, # España vs Cabo Verde
    15: {"gh": 2, "ga": 2, "penaltyWinner": ""}, # Irán vs Nueva Zelanda
    16: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Bélgica vs Egipto
    17: {"gh": 3, "ga": 1, "penaltyWinner": ""}, # Francia vs Senegal
    18: {"gh": 1, "ga": 4, "penaltyWinner": ""}, # Irak vs Noruega
    19: {"gh": 3, "ga": 0, "penaltyWinner": ""}, # Argentina vs Argelia
    20: {"gh": 3, "ga": 1, "penaltyWinner": ""}, # Austria vs Jordania
    23: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Portugal vs RD Congo
    22: {"gh": 4, "ga": 2, "penaltyWinner": ""}, # Inglaterra vs Croacia
    21: {"gh": 1, "ga": 0, "penaltyWinner": ""}, # Ghana vs Panamá
    24: {"gh": 1, "ga": 3, "penaltyWinner": ""}, # Uzbekistán vs Colombia
    25: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # República Checa vs Sudáfrica
    26: {"gh": 4, "ga": 1, "penaltyWinner": ""}, # Suiza vs Bosnia
    27: {"gh": 6, "ga": 0, "penaltyWinner": ""}, # Canadá vs Catar
    28: {"gh": 1, "ga": 0, "penaltyWinner": ""}, # México vs Corea del Sur
    29: {"gh": 3, "ga": 0, "penaltyWinner": ""}, # Brasil vs Haití
    30: {"gh": 0, "ga": 1, "penaltyWinner": ""}, # Escocia vs Marruecos
    31: {"gh": 0, "ga": 1, "penaltyWinner": ""}, # Turquía vs Paraguay
    32: {"gh": 2, "ga": 0, "penaltyWinner": ""}, # Estados Unidos vs Australia
    33: {"gh": 2, "ga": 1, "penaltyWinner": ""}, # Alemania vs Costa de Marfil
    34: {"gh": 0, "ga": 0, "penaltyWinner": ""}, # Ecuador vs Curazao
    35: {"gh": 5, "ga": 1, "penaltyWinner": ""}, # Países Bajos vs Suecia
    36: {"gh": 0, "ga": 4, "penaltyWinner": ""}, # Túnez vs Japón
    38: {"gh": 4, "ga": 0, "penaltyWinner": ""}, # España vs Arabia Saudita
    39: {"gh": 0, "ga": 0, "penaltyWinner": ""}, # Bélgica vs Irán
    37: {"gh": 2, "ga": 2, "penaltyWinner": ""}, # Uruguay vs Cabo Verde
    40: {"gh": 1, "ga": 3, "penaltyWinner": ""}, # Nueva Zelanda vs Egipto
    43: {"gh": 2, "ga": 0, "penaltyWinner": ""}, # Argentina vs Austria
    42: {"gh": 3, "ga": 0, "penaltyWinner": ""}, # Francia vs Irak
    41: {"gh": 3, "ga": 2, "penaltyWinner": ""}, # Noruega vs Senegal
    44: {"gh": 1, "ga": 2, "penaltyWinner": ""}, # Jordania vs Argelia
    47: {"gh": 5, "ga": 0, "penaltyWinner": ""}, # Portugal vs Uzbekistán
    45: {"gh": 0, "ga": 0, "penaltyWinner": ""}, # Inglaterra vs Ghana
    46: {"gh": 0, "ga": 1, "penaltyWinner": ""}, # Panamá vs Croacia
    48: {"gh": 1, "ga": 0, "penaltyWinner": ""}, # Colombia vs RD Congo
    51: {"gh": 2, "ga": 1, "penaltyWinner": ""}, # Suiza vs Canadá
    52: {"gh": 3, "ga": 1, "penaltyWinner": ""}, # Bosnia vs Catar
    49: {"gh": 0, "ga": 3, "penaltyWinner": ""}, # Escocia vs Brasil
    50: {"gh": 4, "ga": 2, "penaltyWinner": ""}, # Marruecos vs Haití
    53: {"gh": 0, "ga": 3, "penaltyWinner": ""}, # República Checa vs México
    54: {"gh": 1, "ga": 0, "penaltyWinner": ""}, # Sudáfrica vs Corea del Sur
    55: {"gh": 0, "ga": 2, "penaltyWinner": ""}, # Curazao vs Costa de Marfil
    56: {"gh": 2, "ga": 1, "penaltyWinner": ""}, # Ecuador vs Alemania
    57: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Japón vs Suecia
    58: {"gh": 1, "ga": 3, "penaltyWinner": ""}, # Túnez vs Países Bajos
    59: {"gh": 3, "ga": 2, "penaltyWinner": ""}, # Turquía vs Estados Unidos
    60: {"gh": 0, "ga": 0, "penaltyWinner": ""}, # Paraguay vs Australia
    61: {"gh": 1, "ga": 4, "penaltyWinner": ""}, # Noruega vs Francia
    62: {"gh": 5, "ga": 0, "penaltyWinner": ""}, # Senegal vs Irak
    63: {"gh": 1, "ga": 1, "penaltyWinner": ""}, # Egipto vs Irán
    64: {"gh": 1, "ga": 5, "penaltyWinner": ""}, # Nueva Zelanda vs Bélgica
    65: {"gh": 0, "ga": 0, "penaltyWinner": ""}, # Cabo Verde vs Arabia Saudita
    66: {"gh": 0, "ga": 1, "penaltyWinner": ""}, # Uruguay vs España
    67: {"gh": 0, "ga": 2, "penaltyWinner": ""}, # Panamá vs Inglaterra
    68: {"gh": 2, "ga": 1, "penaltyWinner": ""}, # Croacia vs Ghana
    69: {"gh": 3, "ga": 3, "penaltyWinner": ""}, # Argelia vs Austria
    70: {"gh": 1, "ga": 3, "penaltyWinner": ""}, # Jordania vs Argentina
    71: {"gh": 0, "ga": 0, "penaltyWinner": ""}, # Colombia vs Portugal
    72: {"gh": 3, "ga": 1, "penaltyWinner": ""}, # RD Congo vs Uzbekistán
    73: {"gh": 0, "ga": 1, "penaltyWinner": ""}, # Sudáfrica vs Canadá (Match 73)
    74: {"gh": 2, "ga": 1, "penaltyWinner": ""}, # Brasil vs Japón (Match 74)
    75: {"gh": 1, "ga": 1, "penaltyWinner": "away", "penh": 3, "pena": 4}, # Alemania vs Paraguay (Match 75)
    76: {"gh": 1, "ga": 1, "penaltyWinner": "away", "penh": 2, "pena": 3}, # Países Bajos vs Marruecos (Match 76)
    77: {"gh": 1, "ga": 2, "penaltyWinner": ""}, # Costa de Marfil vs Noruega (Match 77)
    78: {"gh": 3, "ga": 0, "penaltyWinner": ""}, # Francia vs Suecia (Match 78)
    79: {"gh": 2, "ga": 0, "penaltyWinner": ""}, # México vs Ecuador (Match 79)
    80: {"gh": 2, "ga": 1, "penaltyWinner": ""}, # Inglaterra vs RD Congo (Match 80)
    81: {"gh": 3, "ga": 2, "penaltyWinner": ""}, # Bélgica vs Senegal (Match 81)
    82: {"gh": 2, "ga": 0, "penaltyWinner": ""}, # Estados Unidos vs Bosnia y Herzegovina (Match 82)
    83: {"gh": 4, "ga": 0, "penaltyWinner": ""}, # Portugal vs Croacia (Match 83)
    84: {"gh": 3, "ga": 0, "penaltyWinner": ""}, # España vs Austria (Match 84)
    85: {"gh": 2, "ga": 0, "penaltyWinner": ""}, # Suiza vs Argelia (Match 85)
    86: {"gh": 1, "ga": 1, "penaltyWinner": "away", "penh": 2, "pena": 4}, # Australia vs Egipto (Match 86)
    87: {"gh": 3, "ga": 2, "penaltyWinner": ""}, # Argentina vs Cabo Verde (Match 87)
    88: {"gh": 1, "ga": 0, "penaltyWinner": ""}  # Colombia vs Ghana (Match 88)
}

# Ask for password from argv or use default
password = sys.argv[1] if len(sys.argv) > 1 else "admin123"

# 1. Login to get token
try:
    login_data = json.dumps({"password": password}).encode("utf-8")
    req = urllib.request.Request(
        f"{URL}/api/login",
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as res:
        res_data = json.loads(res.read().decode("utf-8"))
        if res_data.get("success"):
            token = res_data.get("token")
            print("Login successful.")
        else:
            print("Login failed: Success flag false.")
            sys.exit(1)
except Exception as e:
    print(f"Login failed: {e}")
    sys.exit(1)

# 2. Fetch current data to preserve extras
try:
    req = urllib.request.Request(f"{URL}/api/data")
    with urllib.request.urlopen(req) as res:
        res_data = json.loads(res.read().decode("utf-8"))
        current_scores = res_data.get("scores", {})
        extras = res_data.get("extras", {})
        print("Fetched current data successfully.")
except Exception as e:
    print(f"Fetch failed: {e}")
    sys.exit(1)

# 3. Merge new scores
merged_scores = current_scores.copy()
for match_id, score in scores.items():
    merged_scores[str(match_id)] = score

# 4. Save merged data in database
try:
    save_data = json.dumps({"scores": merged_scores, "extras": extras}).encode("utf-8")
    req = urllib.request.Request(
        f"{URL}/api/save",
        data=save_data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    )
    with urllib.request.urlopen(req) as res:
        res_data = json.loads(res.read().decode("utf-8"))
        if res_data.get("success"):
            print("Successfully updated database on Render with the latest World Cup results!")
        else:
            print("Failed to save data: Success flag false.")
except Exception as e:
    print(f"Save failed: {e}")
    sys.exit(1)

# 5. Also save locally in data_store.json in the workspace
try:
    local_path = "/Users/jose/.gemini/antigravity/scratch/porra-mundial/data_store.json"
    local_data = {"scores": merged_scores, "extras": extras}
    with open(local_path, "w", encoding="utf-8") as f:
        json.dump(local_data, f, indent=2)
    print("Successfully updated local data_store.json as well!")
except Exception as e:
    print(f"Failed to update local file: {e}")
