$('#rv-search').on('input', function() {
  var search = $(this).serialize();
  $.get('/?'+search, function(data) {
    $('#rv-grid').html('');
    data.Rvs.forEach(function(rvs) {
      if (rvs.isdeleted==true) {
      $('#rv-grid').append(`
        <div class="md-col-4" style="margin-left: 4%;">
        <a href="../../rvs/${rvs._id}">
            <img src= "../images/${rvs.image[0]}" style="width:300px; height:200px;"/>
        </a>
            <div class="caption" style="text-align: center; font-size: 1.2rem">
              <a href="../../rvs/${rvs._id}">${rvs.make} ${rvs.model} (Deleted)</a>
          	</div>
        </div>
      `);
      }else {
        $('#rv-grid').append(`
        <div class="md-col-4" style="margin-left: 4%;">
        <a href="../../rvs/${rvs._id}">
            <img src= "../images/${rvs.image[0]}" style="width:300px; height:200px;"/>
        </a>
            <div class="caption" style="text-align: center; font-size: 1.2rem">
              <a href="../../rvs/${rvs._id}">${rvs.make} ${rvs.model} </a>
            </div>
        </div>
      `);
      }
    });
    $('#page-grid').html('');
    for (var i = 0 ; i < data.pages; i++) {
        $('#page-grid').append(`
          <li class="page-item"><a class="page-link" href="?page=${i+1}">${i+1}</a></li>
        `);
    }
  });
});


