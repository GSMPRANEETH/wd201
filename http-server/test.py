for i in range(100):
    n=1023+i
    z=1230941 *322-n
    print(z if z%2==0 else 2*z)