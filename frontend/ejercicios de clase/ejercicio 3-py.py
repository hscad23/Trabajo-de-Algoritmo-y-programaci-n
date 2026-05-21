print("==ejercicio 3, sobre precios e inpuestos==")
consumo = float(input("el precio de su consumo es de :"))
if consumo <= 80:
    descuento = consumo*0.05
#forma compuesta o doble 
if consumo > 80:
    descuento = consumo*0.15
#para poder hacerlo mas simple se puede hacer de la siguiente manera :
#else:
#   descuento = consumo*0.15
sub_total= consumo - descuento
igv = sub_total * 0.18
total = sub_total + igv
print("el consumo es : ", consumo)
print("el sub total es de : ", sub_total)
print("el IGV es de :", igv)
print("entonces el precio total por el consumo es : ", total)

