#include <iostream>
using namespace std;
int a;
int main() {
    cout<<"ejercicio 2, saber si el numero es par o no"<<endl;
    cout<<"ingrese cualquier numero: "<<endl;
    cin>>a;
    if (a % 2==0)
        cout<<"el número es par"<<endl;
    if (a % 2 != 0)
        cout<<"el número es impar"<<endl;
//para hacerlo de forma simple :
//  else
//      cout<<"el número es impar"<<endl;
    cout<<"fin de la prueba"<<endl;
    return 0;
}