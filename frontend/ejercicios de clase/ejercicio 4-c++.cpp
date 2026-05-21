#include <iostream>

using namespace std;

int main() {
    char letra;
    
    cout << "Ingrese un caracter: ";
    cin >> letra;

    if (letra == 'a' || letra == 'e' || letra == 'i' || letra == 'o' || letra == 'u') {
        cout << "El caracter ingresado es una vocal minuscula." << endl;
    } else if (letra == 'A' || letra == 'E' || letra == 'I' || letra == 'O' || letra == 'U') {
        cout << "El caracter ingresado es una vocal mayuscula." << endl;
    } else {
        cout << "El caracter ingresado NO es una vocal." << endl;
    }

    return 0;
}