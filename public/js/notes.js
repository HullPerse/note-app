if (!localStorage.getItem('user')) {
    window.location.href = 'index';
}

function preferences() {
    const user = localStorage.getItem('user');
    const colorPreference = JSON.parse(user).colorPreference;
  
    const html = document.getElementsByTagName('html')[0];
  
    if (colorPreference === 'Dark') {
      html.classList.add('dark');
    } else if (html.classList.contains('dark')) {
      html.classList.remove('dark')
    }
}

preferences();

function loadNotes() {
    let type = null;
    let title = null;

    const user = localStorage.getItem('user');

    if (user) {
        const username = JSON.parse(user).username;
        const mainContainer = document.querySelector('#mainContainer');
        mainContainer.innerHTML = `
        <div class="w-max -mt-4 bg-gray-800 rounded-b flex justify-items-center">
            <button class="hover:text-lightText text-darkText px-5 py-3 font-extrabold" onclick="createDialog()"> Add </button>
        </div>
        `;

        fetch(`/getnotes/${username}`)
            .then((response) => response.json())
            .then((notes) => {
                notes.forEach((item) => {
                    const elementContainer = document.createElement('div');
                    elementContainer.classList.add(
                        'flex',
                        'border',
                        'border-lightText',
                        'dark:border-darkText',
                        'rounded',
                        'my-5',
                        'flex-row',
                        'dark:bg-lightBg',
                        'cursor-pointer',
                        'hover:bg-gray-300',
                        'dark:hover:bg-gray-300',
                        'flex-grow'
                    );

                    elementContainer.innerHTML = `
                        <img alt="type" class="pointer-events-none" src='img/${item.type}.svg'>
                        <a class="text-lightText flex items-center font-bold px-3">${item.title.toUpperCase()}</a>
                        <container class="flex-grow flex justify-end text-lightText items-center overflow-hidden">
                            <button class="bg-red-700 font-extrabold p-4 hover:bg-red-500 text-2xl">&times;</button>
                        </container>
                    `;

                    mainContainer.appendChild(elementContainer);

                    elementContainer.querySelector('button').addEventListener('click', (e) => {
                        e.stopImmediatePropagation();

                        removeNote(item.type, item.title);
                    });

                    elementContainer.addEventListener('click', () => {
                        type = item.type;
                        title = item.title
                        mainContainer.innerHTML = `
                            <div class="w-full -mt-4 bg-gray-800 rounded-b flex justify-items-center">
                                <button class="hover:bg-gray-500 hover:rounded text-darkText px-5 py-3 font-extrabold" onclick="settingButton('Go Back')"> Back </button>

                                <input id="edit" type="radio" value="edit" name="edit" class="hidden">
                                <label for="edit" id="editMode" class="group cursor-pointer ml-5 px-5 py-5 font-semibold rounded bg-gray-800 text-darkText">
                                    EDIT
                                </label>
                                <input id="view" type="radio" value="view" name="view" class="hidden">
                                <label id="viewMode" for="view" class="group cursor-pointer px-5 py-5 font-semibold rounded bg-gray-800 text-darkText active">
                                    VIEW
                                </label>

                                <button id="saveTextButton" class="hover:bg-gray-500 hover:rounded text-darkText px-5 py-3 font-extrabold"> Save </button>
                            </div>

                            <section id="viewerSection"  class="py-5 w-full md:overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-darkBg scrollbar-corner-transparent dark:scrollbar-thumb-lightBg overflow-x-hidden">
                            ${marked.parse(item.text)}
                            </section>

                            <section id="editorSection" class="py-5 w-full overflow-scroll">
                                <textarea name="mainTextArea" id="mainTextArea">
                                    ${marked.parse(item.text)}
                                </textarea>
                            </section>
                            `;

                            const CodeMirrorField = CodeMirror.fromTextArea(
                                document.querySelector("#mainTextArea"),
                                {
                                    mode: "xml",
                                    theme: 'monokai',
                                    lineNumbers: true,
                                    autoCloseTags: true
                                });

                        const viewMode = document.querySelector('#viewMode');
                        const editMode = document.querySelector('#editMode');

                        const viewerSection = document.querySelector('#viewerSection');
                        const editorSection = document.querySelector('#editorSection');

                        const saveButton = document.querySelector('#saveTextButton')

                        editorSection.classList.add('hidden');

                        viewMode.addEventListener('click', () => {
                            if (!viewMode.classList.contains('active')) {
                                editMode.classList.remove('active');
                                viewMode.classList.add('active');

                                viewerSection.classList.remove('hidden');
                                editorSection.classList.add('hidden');
                            }
                        });

                        editMode.addEventListener('click', () => {
                            if (!editMode.classList.contains('active')) {
                                viewMode.classList.remove('active');
                                editMode.classList.add('active');

                                editorSection.classList.remove('hidden');
                                viewerSection.classList.add('hidden');
                            }
                        });

                        CodeMirrorField.on('change', () => {
                            viewerSection.innerHTML = CodeMirrorField.getValue();
                        });

                        saveButton.addEventListener('click', () => {
                            const content = {
                              type: type,
                              title: title,
                              username: JSON.parse(localStorage.getItem('user')).username,
                              note: CodeMirrorField.getValue(),
                            };
                          
                            if (type !== null && title !== null) {
                              fetch("/savenote", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(content),
                              })
                                .then((response) => response.json())
                                .then((data) => {
                                  if (data.success) {
                                    console.log(data.success);
                                  } else {
                                    console.log(data.error);
                                  }
                                })
                                .catch((error) => {
                                  console.error("Error updating note:", error);
                                });
                            } else {
                              console.log('This note cannot be saved');
                            }
                          });
                    });
                });
            });
    }
}

loadNotes();

function noteButtons(input) {
    const mainContainer = document.querySelector('#mainContainer');
    const buttonContainer = document.querySelector('#buttonContainer');

    const settingItems = ['Go Back', 'Preferences', 'Security'];
    
    const baseButtons = ['Home', 'Settings'];

    buttonContainer.innerHTML = '';


    switch(input) {

        case 'Home':
            for (let i = 0; i < baseButtons.length; i++) {

                const newLi = document.createElement('li');
                newLi.classList.add('mb-2');

                buttonContainer.appendChild(newLi);

                const button = document.createElement('a');
                button.classList.add('block', 'rounded', 'px-4', 'py-2', 'hover:bg-gray-700', 'cursor-pointer');
                
                button.innerText = baseButtons[i];

                if (button.innerText === 'Home') {
                    button.classList.add('active');
                }

                button.addEventListener('click', () => noteButtons(button.innerText));
                
                newLi.appendChild(button);
            };

            loadNotes();
        break;

        case 'Settings':
            for (let i = 0; i < settingItems.length; i++) {

                const newLi = document.createElement('li');
                newLi.classList.add('mb-2');

                buttonContainer.appendChild(newLi);

                const button = document.createElement('a');
                button.classList.add('block', 'rounded', 'px-4', 'py-2', 'hover:bg-gray-700', 'cursor-pointer');
                
                button.innerText = settingItems[i];

                
                if (button.innerText == 'Preferences') {
                    button.classList.add('active');

                    button.addEventListener('click', () => noteButtons('Settings'));
                } else {
                    button.addEventListener('click', () => settingButton(button.innerText));
                }
                
                newLi.appendChild(button);
            };

            mainContainer.innerHTML = `
        <h1 class="text-2xl font-bold">Color Preference: </h1>
        <div class="flex border border-lightText dark:border-darkText rounded">

            <input id="colorThemeLight" type="radio" value="light" name="colorThemeLight" class="hidden">

            <label for="colorTheme" onclick="colorTheme('Light')" class="group cursor-pointer px-5 py-5 font-semibold text-lightText  bg-lightBg rounded">
                Light Mode
            </label>
        
            <input id="colorThemeDark" type="radio" value="dark" name="colorTheme" class="hidden">
        
            <label for="colorThemeDark" onclick="colorTheme('Dark')" class="group cursor-pointer px-5 py-5 font-semibold text-darkText  bg-darkBg rounded">
                Dark Mode
            </label>
        </div>
            `;
            break;

        default:
            console.log('Invalid input');
            break;
    }
}

function settingButton(input) {

    const baseButtons = ['Home', 'Settings'];

    switch(input) {
        case 'Go Back':
            buttonContainer.innerHTML = '';
            for (let i = 0; i < baseButtons.length; i++) {

                const newLi = document.createElement('li');
                newLi.classList.add('mb-2');

                buttonContainer.appendChild(newLi);

                const button = document.createElement('a');
                button.classList.add('block', 'rounded', 'px-4', 'py-2', 'hover:bg-gray-700', 'cursor-pointer');
                
                button.innerText = baseButtons[i];

                if (button.innerText == 'Home') {
                    button.classList.add('active');
                }

                button.addEventListener('click', () => noteButtons(button.innerText));
                
                newLi.appendChild(button);
            };

            loadNotes();
            break;

        case 'Security':
            console.log('Security');
        break;

        default:
            console.log('Invalid input');
            break;  
    }
};

function colorTheme(color) {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    switch (color) {
        case 'Dark':
            currentUser.colorPreference = 'Dark';

            localStorage.setItem('user', JSON.stringify(currentUser));
        break;

        case 'Light':
            currentUser.colorPreference = 'Light';

            localStorage.setItem('user', JSON.stringify(currentUser));
        break;

        default:
            console.log('No theme found');
        break;
    };

    preferences();
}

function createDialog() {
    const dialog = document.createElement('dialog');

    dialog.classList.add('h-min', 'w-max', 'bg-gray-800', 'p-10', 'rounded', 'md:overflow-y-scroll', 'scrollbar-thumb-rounded-full', 'scrollbar-track-rounded-full', 'scrollbar-thin', 'scrollbar-thumb-darkBg', 'scrollbar-corner-transparent');

    dialog.innerHTML = `
        <select id="underline_select" class="block text-center py-2.5 pr-8 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
            <option selected>Type</option>
            <option value="Note" class="font-bold">Note</option>
        </select>
        
        <container class="flex flex-col">
            <input type="text" id="default-input" class="my-5 rounded w-full text-lightText font-semibold" placeholder="Title:">
    
            <section class="flex-grow flex justify-between items-center">
                <button id="closeModalButton" class="py-3 px-3 bg-red-500 rounded">Cancel</button>
                <button id="createButton" class="py-3 px-3 bg-green-500 rounded">Create</button>
            </section>
        </container>
        `;

    dialog.querySelector('#closeModalButton').addEventListener('click', () => {
        dialog.remove();
    });

    dialog.addEventListener('keydown', (e) => {
        if (e.key == 'Escape') {
            e.preventDefault();
        }
    });

    document.body.appendChild(dialog);

    openDialog(dialog);
}

function openDialog(dialog) {
    dialog.showModal();

    const createButton = document.getElementById('createButton');

    createButton.addEventListener('click', () => {
        const titleText = document.getElementById('default-input').value;
        const name = JSON.parse(localStorage.getItem('user')).username;

        const type = document.getElementById('underline_select').value.toLowerCase();

        if (type !== 'type') {
            const noteData = {
                title: titleText,
                name: name,
                type: type,
            }
    
    
            fetch('/createnote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteData)
            })
                .then(response => response.text())
                .then(data => {
                    if (data) {
                        dialog.remove();
                        loadNotes();
                    }
                });
        }
    });
}

function removeNote(type, title) {
    const dialog = document.createElement('dialog');

    dialog.classList.add('h-min', 'w-max', 'bg-gray-800', 'p-10', 'rounded', 'md:overflow-y-scroll', 'scrollbar-thumb-rounded-full', 'scrollbar-track-rounded-full', 'scrollbar-thin', 'scrollbar-thumb-darkBg', 'scrollbar-corner-transparent');

    dialog.innerHTML = `
        <container class="flex flex-col">
            <p class="text-white pb-5">Are you sure you want to remove this note?</p>
    
            <section class="flex-grow flex justify-between items-center">
                <button id="closeModalButton" class="py-3 px-3 bg-red-500 rounded">Cancel</button>
                <button id="deleteButton" class="py-3 px-3 bg-green-500 rounded">Remove</button>
            </section>
        </container>
        `;

    dialog.querySelector('#closeModalButton').addEventListener('click', () => {
        dialog.remove();
    });

    dialog.addEventListener('keydown', (e) => {
        if (e.key == 'Escape') {
            e.preventDefault();
        }
    });

    dialog.querySelector('#deleteButton').addEventListener('click', () => {
        const deleteInfo = {
            type: type,
            title: title
        }

        fetch('/deletenote', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(deleteInfo)
          })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    dialog.remove();
                    loadNotes();
                };
            })
            .catch((error) => {
              console.error('Error deleting game:', error);
            });
    });

    document.body.appendChild(dialog);

    dialog.showModal();
}