from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from engine_model import simulate_ideal_otto_cycle

app = FastAPI()
    title="TermoOtto API"
    description="API para Simulación de Ciclo Otto"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API de Simulación Termodinámica en funcionamiento"}



@app.get("/simulate")
def simulate_otto(r: float = 10.0, bore: float = 0.08, stroke: float = 0.09, rpm: float = 3000.0):
    try:
        result = simulate_ideal_otto_cycle(r, bore, stroke, rpm)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
