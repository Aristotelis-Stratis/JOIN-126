function newUserTemp(username, email, password, initials) {
    let newUser = {
        name: username,
        email: email,
        password: password,
        contacts: [{
            id: generateUniqueId(),
            color: randomColor(),
            name: username,
            email: email,
            number: "",
            initials: initials
        }],
        board: {
            todo: [
                {
                    id: generateUniqueId(),
                    title: "TestTask",
                    description: "TestDescription",
                    dueDate: "2012-12-12",
                    priority: "urgent",
                    contacts: [],
                    subtasks: [
                        { text: "TestSubtask", completed: false }
                    ],
                    status: "todo",
                    category: "User Story"
                }
            ],
            inProgress: [],
            awaitFeedback: [],
            done: []
        },
        summary: {}
    };

    return newUser;
}

async function userDontExistTemp(username, email, password, initials, cleanedEmail) {
    let newUser = newUserTemp(username, email, password, initials);

    await postData(`users/${cleanedEmail}`, newUser);
    startSlideInUpAnim();
    window.setTimeout(() => { window.location.href = "login.html"; }, 2500);
}


async function successfullLoginTemp(user, userKey, cleanedEmail) {
    rememberCheck();
    console.log('Login erfolgreich!');
    await setCurrentUser(user, userKey, cleanedEmail);
    setTimeout(() => {
        window.location.href = 'summary.html';
    }, 5000);
}