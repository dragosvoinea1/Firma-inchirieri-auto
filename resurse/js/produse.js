window.addEventListener("load", function() {

//filtrare, sortare

document.getElementById("inp-pret").onchange=function(){
    document.getElementById("infoRange").innerHTML = `(${this.value})`;
}

document.getElementById("filtrare").onclick= function(){
    let val_nume=document.getElementById("inp-nume").value.toLowerCase();
    let val_putere;
    let gr_radio = document.getElementsByName("gr_rad");
    for(let r of gr_radio){
        if(r.checked){
            val_putere=r.value;
            break;
        }
    }

    let val_pret = document.getElementById("inp-pret").value;
    let val_brand = document.getElementById("inp-brand").value;
    let checkbox = document.getElementById("inp-usi");
    let check_usi = checkbox.checked;

    var produse=document.getElementsByClassName("produs");

    for (let prod of produse){
        prod.style.display="none";
        let nume=prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

        let cond1 = nume.startsWith(val_nume);
        let cond2 = true;
        if(val_putere!="toate"){
            [nra, nrb]=val_putere.split(":");
            nra = parseInt(nra);
            nrb = parseInt(nrb);
            let putere = parseInt(prod.getElementsByClassName("val-putere_motor")[0].innerHTML);

            cond2 = (nra<=putere && putere<nrb);
        }

        let pret = parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML);

        let cond3 = (val_pret<=pret);

        let brand = prod.getElementsByClassName("val-brand")[0].innerHTML;
        let cond4 = (val_brand == brand || val_brand=="toate");

        let doua_usi = prod.getElementsByClassName("val-usi")[0].innerHTML === "true";
        let cond5 = !check_usi || (check_usi && doua_usi);

        if(cond1 && cond2 && cond3 && cond4 && cond5){
            prod.style.display="block";
        }
    }
}

document.getElementById("resetare").onclick= function(){
    document.getElementById("inp-nume").value="";
    document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
    document.getElementById("inp-brand").value = "toate";
    document.getElementById("i_rad4").checked = true;
    var produse = document.getElementsByClassName("produs");
    for(let prod of produse){
        prod.style.display = "block";
    }
}

function sortare (semn){
    var produse=document.getElementsByClassName("produs");
    var v_produse= Array.from(produse);
    v_produse.sort(function (a,b){
        let pret_a=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
        let pret_b=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
        if(pret_a==pret_b){
            let nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
            let nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
            return semn*nume_a.localeCompare(nume_b);
        }
        return semn*(pret_a-pret_b);
    });
    for(let prod of v_produse){
        prod.parentElement.appendChild(prod);
    }
}
document.getElementById("sortCrescNume").onclick=function(){
    sortare(1);
}
document.getElementById("sortDescrescNume").onclick=function(){
    sortare(-1);
}

window.onkeydown= function(e){
    if (e.key=="c" && e.altKey){
        if(document.getElementById("info-suma"))
            return;
        var produse=document.getElementsByClassName("produs");
        let suma=0;
        for (let prod of produse){
            if(prod.style.display!="none")
            {
                let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                suma+=pret;
            }
        }
        
        let p=document.createElement("p"); //creeaza paragraf
        p.innerHTML=suma;
        p.id="info-suma";
        ps=document.getElementById("p-suma");
        container = ps.parentNode;
        frate=ps.nextElementSibling; //pt afisare dupa textul "alt+c etc"
        container.insertBefore(p, frate);
        setTimeout(function(){
            let info=document.getElementById("info-suma");
            if(info)
                info.remove();
        }, 1000)
    }
}

});