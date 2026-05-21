letra = input("Ingrese un carácter: ")

if letra in "aeiou":
    print("El carácter ingresado es una vocal minúscula.")
elif letra in "AEIOU":
    print("El carácter ingresado es una vocal mayúscula.")
else:
    print("El carácter ingresado NO es una vocal.")