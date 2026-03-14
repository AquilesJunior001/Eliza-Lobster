class Pessoa:
    def __init__(self,nome):
        self.nome = nome
class Inscricao:
    def __init__(self):
        self.valor = 0
class InscricaoDeAluno(Inscricao):
    def __init__(self,universidade):
        super().__init__()
        self.valor = 50
        self.universidade = universidade
class InscricaoDeProfessor(Inscricao):
    def __init__(self,universidade):
        super().__init__()
        self.valor = 80
        self.universidade = universidade
class InscricaoDeProfissional(Inscricao):
    def __init__(self,empresa):
        super().__init__()
        self.valor = 120
        self.empresa = empresa
class Encoinfo:
    def __init__(self):
        self.inscritos = []
        self.atendentes = []
class Inscrito:
    def __init__(self,pessoa,inscricao):
        self.pessoa = pessoa
        self.inscricao = inscricao
class Atendente(Pessoa):
    def __init__(self,nome,encoinfo):
        super().__init__(nome)
        self.encoinfo = encoinfo
        self.cont = [0,0,0,0]
    def atender(self,pessoa,inscricao):
        self.cont[0]+=1
        if len(self.encoinfo.inscritos)<100:
            self.encoinfo.inscritos.append(Inscrito(pessoa,inscricao))
        else:
            self.emitir_relatorio()
    def emitir_relatorio(self):
        ca = 0
        cprof = 0
        cprofi = 0
        self.cont[0]-=1
        self.cont[3]-=1
        for i in self.encoinfo.inscritos:
            if type(i.inscricao)==InscricaoDeAluno:
                ca+=1
            elif type(i.inscricao)==InscricaoDeProfessor:
                cprof+=1
            else:
                cprofi+=1
        print('Relatorio')
        for i in self.encoinfo.atendentes:
            print(i.nome,i.cont[0])
            print('Total Inscrições por Alunos',i.cont[1])
            print('Total Inscrições por Professores',i.cont[2])
            print('Total Inscrições por Profissionais',i.cont[3])
        print('Total Pago por Alunos',ca*50)
        print('Total Pago por Professores',cprof*80)
        print('Total Pago por Profissionais',cprofi*120)
        print('Total Pago',ca*50+cprof*80+cprofi*120)
e = Encoinfo()
import random
listanomes = ['João','Pedro','Paulo','Marcos','Jones','Maria','Marta']
listasobrenomes = ['Silva','Soares','Alves','Freitas','Gomes']
e.atendentes = (Atendente('Crisley',e),Atendente('Athos',e),Atendente('Cleito',e))
tipo = (InscricaoDeAluno('Ulbra'),InscricaoDeProfessor('Ulbra'),InscricaoDeProfissional('Tec Mundo'))
for n in range(70):
    p = listanomes[random.randrange(len(listanomes))]+' '+listasobrenomes[random.randrange(len(listasobrenomes))]
    atendente = e.atendentes[random.randrange(len(e.atendentes))]
    atendente.cont[1]+=1
    atendente.atender(p,InscricaoDeAluno('Ulbra'))
for n in range(20):
    p = listanomes[random.randrange(len(listanomes))]+' '+listasobrenomes[random.randrange(len(listasobrenomes))]
    atendente = e.atendentes[random.randrange(len(e.atendentes))]
    atendente.cont[2]+=1
    atendente.atender(p,InscricaoDeProfessor('Ulbra'))
for n in range(11):
    p = listanomes[random.randrange(len(listanomes))]+' '+listasobrenomes[random.randrange(len(listasobrenomes))]
    atendente = e.atendentes[random.randrange(len(e.atendentes))]
    atendente.cont[3]+=1
    atendente.atender(p,InscricaoDeProfissional('Tec Mundo'))
