const limit = 250;
let page = 1;
let getContactsListQueryUrl = '/api/v4/contacts';
let createTasksQueryUrl = '/api/v4/tasks';
let contactsWithNoDeals = [];

function getContactsWithNoDeals() {
    $.ajax({
        url: getContactsListQueryUrl,
        method: 'GET',
        data: {
            limit: limit,
            with: 'leads',
            page: page
        }
    }).done(function(data) {
        if (!!data) {
            //находим контакты без сделок
            contactsWithNoDeals = data._embedded.contacts.filter(function(contact) {
              return contact._embedded.leads.length == 0;
            });

            if (contactsWithNoDeals.length == 0)
                console.log('Контактов без сделок нет');
            else
                //создаем задачи для контактов без сделок
                createTasks();
        } else {
            console.log('Контактов нет');
            return false;
        }
    }).fail(function(data) {
        console.log('Что-то пошло не так c получением контактов');
        console.log(data);
        return false;
    })

    page++;
}

function createTasks() {
    let tasks = [];
    //создаем данные для запроса
    contactsWithNoDeals.forEach(function(item, i, arr) {
      let task = {"entity_id":item.id, "entity_type":"contacts", "text":"Контакт без сделок", "complete_till":parseInt(new Date().getTime()/1000) + 604800};
      tasks.push(task);
    });

    console.log(tasks);
    
    $.ajax({
        url: createTasksQueryUrl,
        method: 'POST',
        data: JSON.stringify(tasks),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    }).done(function(data) {
        if (!!data) {
            console.log('Задачи были созданы');
        } else {
            console.log('Задачи не были созданы');
            return false;
        }
    }).fail(function(data) {
        console.log('Что-то пошло не так c созданием задач');
        console.log(data);
        return false;
    })
}
getContactsWithNoDeals();