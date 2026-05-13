import pandas
a=pandas.read_csv("5000_members_with_experience.csv")
print("user login page")
A=input("enter your full name: ")
B=input("enter your email: ")
C=input("enter your role: ")
D=input("enter your skills: ")
E=input("enter your  projects: ")
F=input("enter your education: ")
G=input("enter your educational_tier: ")
H=input("enter your GPA: ")
I=input("enter your  score: ")
print("HR's REQUIREMENT")
q = input("Enter the role you need: ")
w = input("Enter the experience years you need: ")
x = input("Enter the educational qualification: ")
y = input("Enter the internship_company: ").title()
u = input("Enter the projects: ")
i = input("Enter the GPA: ")
p = input("Enter the number of skills you need: ")
U=input("type ex for exact requirements and sh for shortlisting: ")
if U=="ex":
    m=a[(a["work_experience"]==w)&(a["projects"]==int(u))&(a["internship_company"]==str(y))
        &(a["domain"]==str(q))&(a["gpa"]==i)&(a["education"]==str(x))&(a["skills"]==str(p))]
    print(m.name)
if U=="sh":
     W=a[a.work_experience==int(w)]
     print(W.educationalqualification)
     print(W.name)
     U=a[a.projectsdone==int(u)]
     print(U.skills)
     print(U.name)
     X=a[a.educationqualification ==x]
     Y=a[a.internship_company==int(y)]
     Q = a[a.domain== q]
     print(Q.name)
     I=a[a.gpa==i]
     R=a[a.skills==str(p)]
     print(R.name)
