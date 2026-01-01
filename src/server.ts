function welcome(name: string) {
    console.log(`Welcome ${name}`);

    const user = {
        name: "John Doe",
        age: 30,
        isPaid: true,
    };

    const fname = user.name;
    return name + fname;
}

welcome("John Doe");
