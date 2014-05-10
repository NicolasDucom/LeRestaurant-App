var orderedElemId = null;
var currentOrder = null;
$.ajaxSetup({ cache: false });

function getCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) 
    {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}

function updateTicket()
{
    var ticketContent = '';
    for (var i = 0; i < currentOrder.elements.length; i++) {
        ticketContent += "<div id='order"+i+"'>"+currentOrder.elements[i].quantite+"x"+currentOrder.elements[i].element.nom;
        ticketContent += " - <orderStatus>"+currentOrder.elements[i].etat+"</orderStatus>";
        ticketContent += "<orderPrice>"+currentOrder.elements[i].element.prix*currentOrder.elements[i].quantite+"€</orderPrice><br />";
        ticketContent += "</div>";
    };
    $('#menuContent').html(ticketContent);
    $('#menuTotalPrice').html("<br>"+currentOrder.total+" €");
}

$( document ).on( "pagecreate", "#page1", function() {
    $( document ).on( "swipeleft", "#page1", function( e ) {
        if ( $( ".ui-page-active" ).jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swipeleft" ) {
                $.ajax({
                    type: 'GET',
                    url: 'http://lerestaurant.flst.fr/app/api/commandes/'+getCookie('idCommande'),
                    success: function(data) {  
                        currentOrder = data;
                        updateTicket(); 
                    },
                    error: function() {
                      
                    }
                });
                $( "#right-panel" ).panel( "open" );
            } 
        }
    });

$(document).on('click',".orderButton",function(){
    orderedElemId = $(this).attr("data-id");
});

$(document).on('click',"#payButton",function(){
     $("#popupPay").popup( "open" );
});

$(document).on('click',"#confirmPayButton",function(){
    $.ajax({
        type: 'PUT',
        url: 'http://lerestaurant.flst.fr/app/api/commandes/',
        data: { 
            idCommande: getCookie('idCommande'),
            etat: 'PAIEMENT EN ATTENTE',
        },
        success: function(data) {
            window.location.replace('finish.html');   
        },
        error: function() {
        }
    });
});

$(document).on('click',"#cancelPayButton",function(){
     $("#popupPay").popup( "close" );
});

$(document).on('click',"#confirmOrderButton",function(){
    $.ajax({
        type: 'POST',
        url: 'http://lerestaurant.flst.fr/app/api/elements-de-commande/',
        data: { 
            idCommande: getCookie('idCommande'),
            idElement: orderedElemId,
            quantite : $('#orderQty').val()
        },
        success: function(data) {   
          $("#popupNbr").popup( "close" );
        },
        error: function() {
          alert('Erreur de requête lors de l\'ajout d\'element'); 
        }
    });
});

 $(document).on('click','.qtyplus',function(e){
    e.preventDefault();
    fieldName = $(this).attr('field');
    var currentVal = parseInt($('input[name='+fieldName+']').val());
    if (!isNaN(currentVal)) {
        $('input[name='+fieldName+']').val(currentVal + 1);
    } else {
        $('input[name='+fieldName+']').val(0);
    }
});

 $(document).on('click','.qtyminus',function(e) {
    e.preventDefault();
    fieldName = $(this).attr('field');
    var currentVal = parseInt($('input[name='+fieldName+']').val());
    if (!isNaN(currentVal) && currentVal > 0) {
        $('input[name='+fieldName+']').val(currentVal - 1);
    } else {
        $('input[name='+fieldName+']').val(0);
    }
}); 
});

$("#submitButton").on("click",function( event ) {
    document.cookie = "idTable" + "=" +$("#tableNb").val()+"; ";
    window.location.replace('login.html');
});

$(document).on("click","#loginButton",function( event ) {
    var mailClient = $("#mailClient").val();
    document.cookie = "mailClient" + "=" +mailClient+"; ";      
    $.ajax({
        type: 'POST',
        url: 'http://lerestaurant.flst.fr/app/api/clients/check',
        data: { email: mailClient },
        success: function(data) {
            var cli = data; 
            document.cookie = "idClient" + "=" +cli.id+"; ";
            document.cookie = "nomClient" + "=" +cli.nom+"; ";
            document.cookie = "prenomClient" + "=" +cli.prenom+"; ";
            $.ajax({
                type: 'POST',
                url: 'http://lerestaurant.flst.fr/app/api/commandes/',
                data: { 
                    idClient: getCookie('idClient'),
                    table: getCookie('idTable') 
                },
                success: function(data) { 
                  document.cookie = "idCommande" + "=" +data.id+"; "; 
                  window.location.replace('menu.html');    
                },
                error: function() {
                    alert('Erreur de requête lors de la creation de commande');                
                }
            });          
        },
        error: function() {
            alert('Cet Email n\'existe pas');  
        }
    }); 
});   




        

        