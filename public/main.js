$(document).ready(function() {
  $('#cardForm').submit(function(event) {
    event.preventDefault();

    const formData = {
      cardType: $('#cardType').val(),
      cardName: $('#cardName').val(),
      cardDescription: $('#cardDescription').val(),
      battlePoints: $('#battlePoints').val()
    };

    $.ajax({
      type: 'POST',
      url: '/api/cards',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function(data) {
        $('#message').text(data.message);
        $('#cardForm')[0].reset();
      },
      error: function(err) {
        $('#message').text('Error al registrar la carta');
      }
    });
  });


  $('#loadCards').click(function() {
    loadCards(1);
  });


  function loadCards(page) {
    const sortBy = $('#sortBy').val();
    const sortOrder = $('#sortOrder').val();
    const cardTypeFilter = $('#filterByCardType').val();
  
    $.ajax({
      type: 'GET',
      url: `/api/cards?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&cardType=${cardTypeFilter}`,
      success: function(data) {
        console.log(data);
        $('#cardTable tbody').empty();
        data.cards.forEach(function(card) {
          const row = `<div class="card" id="${card.cardType}">
                       <tr class="card" data-id="${card._id}">
                        <td>${card.cardType}</td>
                        <td>${card.cardName}</td>
                        <td>${card.cardDescription}</td>
                        <td>${card.battlePoints}</td>
                        <div class ="buttons">
                        <button class="editButton" data-id="${card._id}">Editar</button>
                        <button class="deleteButton" data-id="${card._id}">Eliminar</button>
                        </div>
                      </tr>
                    </div>`;
          $('#cardTable tbody').append(row);
        });
  $('#currentPage').text(data.currentPage);
  $('#totalPages').text(data.totalPages);
  
},
      error: function(err) {
        $('#message').text('Error al cargar las cartas');
      }
    });
  }

  $('#cardTable').on('click', '.editButton', function() {
    const cardId = $(this).attr('data-id');
    console.log(cardId);
    $.ajax({
      type: 'GET',
      url: `/api/cards/${cardId}`,
      success: function(card) {
        $('#updateCardType').val(card.cardType);
        $('#updateCardName').val(card.cardName);
        $('#updateCardDescription').val(card.cardDescription);
        $('#updateBattlePoints').val(card.battlePoints);
        $('#updateCardForm').fadeIn();
      },
      error: function(err) {
        $('#message').text('Error al obtener los detalles de la carta');
      }
    });
  });

  $('#closeUpdateForm').click(function() {
    $('#updateCardForm').fadeOut();
  });


  $('#searchButton').click(function() {
    const searchTerm = $('#searchTerm').val();

    $.ajax({
      type: 'GET',
      url: `/api/cards/search?term=${encodeURIComponent(searchTerm)}`,
      success: function(cards) {
        $('#cardTable tbody').empty();
        cards.forEach(function(card) {
          const row = `<div class="card" id="${card.cardType}">
          <tr class="card" data-id="${card._id}">
           <td>${card.cardType}</td>
           <td>${card.cardName}</td>
           <td>${card.cardDescription}</td>
           <td>${card.battlePoints}</td>
           <div class ="buttons">
           <button class="editButton" data-id="${card._id}">Editar</button>
           <button class="deleteButton" data-id="${card._id}">Eliminar</button>
           </div>
         </tr>
       </div>`;
          $('#cardTable tbody').append(row);
        });
      },
      error: function(err) {
        $('#message').text('Error al buscar cartas');
      }
    });
  });


  $('#closeUpdateForm').click(function() {
    $('#updateCardForm').fadeOut();
  });

  $('#updateForm').submit(function(event) {
    event.preventDefault();

    const formData = {
      cardType: $('#updateCardType').val(),
      cardName: $('#updateCardName').val(),
      cardDescription: $('#updateCardDescription').val(),
      battlePoints: $('#updateBattlePoints').val()
    };

    const cardId = $(this).closest('tr').attr('data-id');
    $.ajax({
      type: 'PUT',
      url: `/api/cards/${cardId}`,
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function(data) {
        $('#message').text(data.message);
        $('#updateCardForm').fadeOut();
        $('#loadCards').click(); // Actualizar la tabla después de la actualización
      },
      error: function(err) {
        $('#message').text('Error al actualizar la carta');
      }
    });
  });

  $('#cardTable').on('click', '.deleteButton', function() {
    const cardId = $(this).attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: `/api/cards/${cardId}`,
      success: function(data) {
        $('#message').text(data.message);
        $('#loadCards').click();
      },
      error: function(err) {
        $('#message').text('Error al eliminar la carta');
      }
    });
  });
  $('#prevPage').click(function() {
    const currentPage = parseInt($('#currentPage').text());
    if (currentPage > 1) {
      loadCards(currentPage - 1);
    }
  });
  
  $('#nextPage').click(function() {
    const currentPage = parseInt($('#currentPage').text());
    const totalPages = parseInt($('#totalPages').text());
    if (currentPage < totalPages) {
      loadCards(currentPage + 1);
    }
  });
});