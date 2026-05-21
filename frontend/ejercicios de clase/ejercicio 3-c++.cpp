#include <iostream>
#include <cmath> 
using namespace std;

//definr las variables
double consumo, descuento, sub_total, igv, total;
double main() {
    cout<<"==ejercicio 3, sobre precios e inpuestos=="<<endl;
    cout<<"el precio de su consumo es de :"<<endl;
    cin>>consumo;
    if (consumo <=80)
        descuento = consumo *0.05;
//forma doble:
    if (consumo > 80)
        descuento = consumo * 0.15;
//forma simple:
//  else
//  descuento = consumo * 0.15;
    sub_total= consumo - descuento;
    igv = sub_total * 0.18;
    total = sub_total + igv;
    cout<<"el consumo es: "<<consumo<<endl;
    cout<<"el sub total es de : "<<sub_total<<endl;
    cout<<"el IGV es de :"<<igv<<endl;
    cout<<"entonce el precio total a pagar es de :"<<total<<endl;
    return 0;
}