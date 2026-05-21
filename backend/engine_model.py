import numpy as np

def simulate_ideal_otto_cycle(r: float, bore: float, stroke: float, rpm: float):
    """
    Simula el ciclo Otto ideal (pseudotransitorio) retornando 
    vectores de ángulo, volumen, presión y temperatura.
    
    r: Relación de compresión
    bore: Diámetro del cilindro (m)
    stroke: Carrera del pistón (m)
    rpm: Revoluciones por minuto
    """
    # Geometría
    a = stroke / 2.0  # Radio del cigüeñal
    L = stroke * 1.5  # Longitud aproximada de la biela (asumiendo L/a = 3)
    R = L / a
    
    Vd = (np.pi / 4) * (bore**2) * stroke  # Volumen desplazado
    Vc = Vd / (r - 1)  # Volumen de la cámara de combustión
    
    # Termodinámica base (Aire frío estándar)
    gamma = 1.4
    Cv = 718  # J/kg.K
    R_gas = 287 # J/kg.K
    
    # Condiciones iniciales (Admisión)
    P_atm = 101325  # Pa
    T_atm = 300     # K
    
    # Resolución angular (paso de 1 grado)
    theta = np.linspace(0, 4*np.pi, 720)
    
    # Vector de Volumen
    term1 = R + 1 - np.cos(theta)
    term2 = np.sqrt(R**2 - np.sin(theta)**2)
    V = Vc + (Vd / 2) * (term1 - term2)
    
    P = np.zeros_like(theta)
    T = np.zeros_like(theta)
    
    # Etapa 1: Admisión (0 a pi)
    mask_intake = (theta <= np.pi)
    P[mask_intake] = P_atm
    T[mask_intake] = T_atm
    
    # Masa de aire admitida (Gas Ideal: PV = mRT)
    m = (P_atm * (Vc + Vd)) / (R_gas * T_atm)
    
    # Etapa 2: Compresión (pi a 2pi)
    # Proceso isentrópico: P * V^gamma = C
    mask_comp = (theta > np.pi) & (theta <= 2*np.pi)
    V_comp = V[mask_comp]
    C_comp = P_atm * (V[np.pi == theta][0] if len(V[np.pi == theta]) > 0 else (Vc+Vd))**gamma
    P[mask_comp] = C_comp / (V_comp**gamma)
    T[mask_comp] = P[mask_comp] * V_comp / (m * R_gas)
    
    # Condición al final de compresión
    P2 = P[mask_comp][-1]
    T2 = T[mask_comp][-1]
    
    # Etapa 3: Combustión instantánea (en 2pi)
    # Asumimos calor añadido Q_in
    Q_in = 1500000 * m  # Energía aproximada por ciclo
    T3 = T2 + Q_in / (m * Cv)
    P3 = P2 * (T3 / T2)
    
    # Modificamos el último punto de compresión para representar la subida isocórica
    P[np.argmin(np.abs(theta - 2*np.pi))] = P3
    T[np.argmin(np.abs(theta - 2*np.pi))] = T3
    
    # Etapa 4: Expansión (2pi a 3pi)
    mask_exp = (theta > 2*np.pi) & (theta <= 3*np.pi)
    V_exp = V[mask_exp]
    C_exp = P3 * (Vc**gamma)
    P[mask_exp] = C_exp / (V_exp**gamma)
    T[mask_exp] = P[mask_exp] * V_exp / (m * R_gas)
    
    # Etapa 5: Escape (3pi a 4pi)
    # Caída de presión instantánea a P_atm en 3pi, luego escape isobárico
    mask_exh = (theta > 3*np.pi)
    P[mask_exh] = P_atm
    T[mask_exh] = T_atm  # Simplificación, los gases salen
    
    # Cálculos de rendimiento
    W_out = np.trapz(P[mask_exp], V[mask_exp])
    W_in = np.trapz(P[mask_comp], V[mask_comp])
    W_net = W_out + W_in # Trabajo neto (J)
    
    efficiency = W_net / Q_in
    power = W_net * (rpm / 120) # W (2 revoluciones por ciclo)
    imep = W_net / Vd # Pa
    
    return {
        "theta": theta.tolist(),
        "volume": V.tolist(),
        "pressure": P.tolist(),
        "temperature": T.tolist(),
        "metrics": {
            "efficiency": efficiency * 100,
            "power": power / 1000, # kW
            "imep": imep,
            "tmax": T3,
            "wnet": W_net
        }
    }
