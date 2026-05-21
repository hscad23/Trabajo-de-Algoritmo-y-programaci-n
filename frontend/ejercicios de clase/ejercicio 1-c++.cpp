#include <iostream>
using namespace std;
int a, b;
int main() {
    cout<<"ejercicio 1 en c++"<<endl;
    cout<<"ingrese su numero"<<endl;
    cin>>a;
    if (a % 2 == 0)
        b=a*3;
    if (a % 2 != 0)
        b=a*2;
    //para hacerlo de forma simple es de la forma:
    //else 
    //  b=a*3;
    cout<<"el resultado de su número es: "<<b<<endl;
    return 0;
}

