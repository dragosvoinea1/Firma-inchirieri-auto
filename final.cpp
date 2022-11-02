#include <iostream>
#include <cstring>

using namespace std;

class Angajati {
    int age, nrangajati;
    char *name;
    char *id;
public:
    void *getName() {
        return name;
    }

    void *setName(char *name) {
        this->name = name;
    }

    int getAge() {
        return age;
    }

    void setAge(int age) {
        this->age = age;
    }

    void *getid() {
        return id;
    }

    void *setid(char *id) {
        this->id = id;
    }

    Angajati(const char *id, const char *name, int age) { //constructor
        this->age = age;
        size_t len = strlen(name);
        this->name = new char[len + 1];
        strcpy(this->name, name);
        size_t len_id = strlen(id);
        this->id = new char[len_id + 1];
        strcpy(this->id, id);
    }

    Angajati(const Angajati &ang) {   //de copiere
        size_t len = strlen(ang.name);
        name = new char[len + 1];
        strcpy(name, ang.name);
        size_t len2 = strlen(ang.id);
        id = new char[len2 + 1];
        strcpy(id, ang.id);
        age = ang.age;
    }


    ~Angajati() {
        delete[] name;
        delete[] id;
    }

    friend std::istream &operator>>(std::istream &is, Angajati &s) {
        char buf[100];
        is >> buf;
        s.setName(buf);
        char buf2[100];
        is >> buf2;
        s.setid(buf2);
        is >> s.age;
        return is;
    }

    friend std::ostream &operator<<(std::ostream &os, Angajati &s) {
        if (!s.name) {
            os << "Not initialized\n";
            return os;
        }
        os << " ID: " << s.id << endl << " Nume angajat: " << s.name << endl << " varsta: " << s.age << '\n';
        return os;
    }

    friend class Meniu;
};

class Meniu {
    int pret;
    char *fel_mancare;
public:
    void *getFel_mancare() {
        return fel_mancare;
    }

    void *setFel_mancare(char *fel_mancare) {
        this->fel_mancare = fel_mancare;
    }

    int getpret() {
        return pret;
    }

    void getpret(int pret) {
        this->pret = pret;
    }

    Meniu(char *fel_mancare, int pret) { //constructor
        this->pret = pret;
        size_t len = strlen(fel_mancare);
        this->fel_mancare = new char[len + 1];
        strcpy(this->fel_mancare, fel_mancare);
    }

    void Replace(Angajati &angajat, char *nume, int varsta) {
        if (strcmp(angajat.id, "bucatar") == 0) {
            angajat.id = "bucatar_new";
            strcpy(angajat.name, nume);
            angajat.age = varsta;
        } else if (strcmp(angajat.id, "ospatar") == 0) {
            angajat.id = "ospatar_new";
            strcpy(angajat.name, nume);
            angajat.age = varsta;
        }
    }

    friend std::istream &operator>>(std::istream &is, Meniu &m) {
        char buf[100];
        is >> buf;
        m.setFel_mancare(buf);
        is >> m.pret;
        return is;
    }

    friend std::ostream &operator<<(std::ostream &os, Meniu &m) {
        if (!m.fel_mancare) {
            os << "Not initialized\n";
            return os;
        }
        os << " Fel de mancare: " << m.fel_mancare << "  " << " Pret: " << m.pret << endl;
        return os;
    }
};

int main() {
    char nume[20], id[20];
    int varsta, i;
    Meniu *menu[4];
    //meniul interactiv l-am facut doar pe 4 exemple
    menu[0] = new Meniu("ceafa de porc", 30);
    menu[1] = new Meniu("pizza", 32);
    menu[2] = new Meniu("piept de pui", 28);
    menu[3] = new Meniu("muschi de vita", 60);
    cout << "0. Quit" << endl << "1. Prezentare meniu" << endl << "2. Alegere meniu" << endl;
    int alegere, alegere_meniu;
    do {
        cin >> alegere;
        switch (alegere) {
            case 0:
                cout
                        << "Va multumim, comanda dumneavoastra va fi pregatita in scurt timp."
                        << endl;
                break;
            case 1:
                for (int i = 0; i < 4; i++)
                    cout << i << ')' << *menu[i];
                break;
            case 2: {
                cout << "Alegeti unul din meniurile de mai sus. Dupa ce v-ati decis, apasati 0." << endl;
                cin >> alegere_meniu;
                switch (alegere_meniu) {
                    case 0:
                        cout << "Ati ales ceafa de porc, pret 30 RON";
                        break;
                    case 1:
                        cout << "Ati ales pizza, pret 32 RON";
                        break;
                    case 2:
                        cout << "Ati ales piept de pui, pret 28 RON";
                        break;
                    case 3:
                        cout << "Ati ales muschi de vita, pret 60 RON";
                        break;
                    default:
                        cout << "Eroare";
                }
                break;
            }
            default:
                cout << "Eroare";
        }
    } while (alegere != 0);

    //partea aceasta este pentru verificat clasa Angajati si legatura sa cu clasa Meniu
    Angajati *angajat[3];
    int n;
    cout << "Citeste numarul de angajati:" << endl;
    cin >> n;
    for (i = 0; i < n; i++) {
        cout << "Citeste id, nume, varsta:" << endl;
        cin >> id >> nume >> varsta;
        angajat[i] = new Angajati(id, nume, varsta);
    }
    for (i = 0; i < n; i++)    //afieaza tot ce am citit in clasa angajati
        cout << *angajat[i] << endl;

    Angajati *copie = angajat[1];
    angajat[1] = angajat[0];  //verificare constructor de copiere cu afisare mai jos
    cout << "copiere:\n" << *angajat[1] << endl;
    angajat[1] = copie;
    Meniu *meniu;
    cout << "Afisare dupa ce am schimbat angajatii:\n";
    char name[20];
    int age;
    for (i = 0; i < n; i++)      //pentru clasa Meniu care e friend cu Angajati
    {
        cout << "Nume si varsta angajat nou:\n";
        cin >> name >> age;
        meniu->Replace(*angajat[i], name, age);
    }
    for (i = 0; i < n; i++)
        cout << *angajat[i] << endl;
    return 0;
}