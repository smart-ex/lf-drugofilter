document.addEventListener("DOMContentLoaded", () => {
    var cont = document.querySelector("#homework-container");
    var list = document.querySelectorAll(".list");
    var button = document.querySelector("button");
    var filter = document.querySelector(".filter");
    cont.addEventListener("dragenter", handleDrag);
    cont.addEventListener("dragover", handleDrag);

    function handleDrag(e) {
        e.preventDefault();
    }
    
    function api(method, params) {
        return new Promise((resolve, reject) => {
            VK.api(method, params, data => {
                if (data.error) {
                    reject(new Error(data.error.error_msg));
                } else {
                    resolve(data.response);
                }
            });
        });
    }

    function drop(e) {
        e.preventDefault();

        let item = document.querySelector(".dragged");

        if (this.classList.contains("list")) {
            this.appendChild(item);
        }
        item.classList.remove("dragged");
    }

    function move(e) {
        if (e.target.className == "action") {
            if (this.classList.contains("selected")) {
                list[0].appendChild(e.target.parentNode);
            } else {
                list[1].appendChild(e.target.parentNode);
            }
        }
    }

    function saveList() {
        let selected = [];
        list[1].childNodes.forEach(el => {
            if (el.id) {
                selected.push(el.id);
            }
        });
        localStorage.setItem("selected", JSON.stringify(selected));
        window.alert(
            "Список друзей сохранен. Длинна списка: " + selected.length
        );
    }

    function isMatching(full, chunk) {
        let str = full.toUpperCase(),
            req = chunk.toUpperCase();

        return chunk ? str.includes(req) : false;
    }

    function friendsFilter(e) {
        var filList;
        if (e.target.name == "friends") {
            filList = list[0];
        } else {
            filList = list[1];
        }
        var names = filList.querySelectorAll(".name");
        names.forEach(name => {
            if (e.target.value) {
                name.parentNode.style.display = "none";
                if (isMatching(name.innerText, e.target.value)) {
                    name.parentNode.style.display = "";
                }
            } else {
                name.parentNode.style.display = "";
            }
        });
    }

    const promise = new Promise((resolve, reject) => {
        VK.init({
            apiId: 6191418
        });

        VK.Auth.login(data => {
            if (data.session) {
                resolve(data);
            } else {
                reject(new Error("Не удалось авторизоваться"));
            }
        }, 16);
    });

    promise
        .then(data => {
            return api("friends.get", {
                v: 5.68,
                fields: "first_name, last_name, photo_100"
            });
        })
        .then(data => {
            let selected = JSON.parse(localStorage.getItem("selected"));
            let leftList = [],
                rightList = [];
            if (selected) {
                data.items.forEach(el => {
                    if (selected.includes("id_" + el.id)) {
                        rightList.push(el);
                    } else {
                        leftList.push(el);
                    }
                });
            } else {
                leftList = data.items;
            }
            const templateElement = document.querySelector("#userTemplate"),
                source = templateElement.innerHTML,
                render = Handlebars.compile(source),
                templateL = render({ list: leftList }),
                templateR = render({ list: rightList });

            list[0].innerHTML = templateL;
            list[1].innerHTML = templateR;
        })
        .catch(function(e) {
            console.log("Ошибка: " + e.message);
        });

    cont.addEventListener("dragstart", function(e) {
        document
            .querySelectorAll(".dragged")
            .forEach(el => el.classList.remove("dragged"));
        if (e.target.className == "item") {
            e.target.classList.add("dragged");
        } else {
            e.preventDefault();
        }
    });
    filter.addEventListener("keyup", friendsFilter);
    button.addEventListener("click", saveList);

    list.forEach(el => {
        el.addEventListener("drop", drop, false);
        el.addEventListener("click", move, false);
    });
});
