/**
 * Created by Maxim Omelchenko on 25.12.2014 at 17:51.
 */

//var searchField = s('input#search');
var searchInitiated = false;
// Ajax request handle
var searchRequest;
var searchTimeout;
var fmLoader;

s('.field_material_btn_select').pageInit(function(btn){

    var buttonSelect = btn;
    var buttonDelete = s('.__deletefield', btn.parent());

    buttonSelect.ajaxClick(function(response){
        var box = s(response.html);
        box.hide();
        box.appendTo('body');
        box = tinybox(box, true, true, true);
        box.show();
        var getAttributes = btn.a('getattr');
        fieldMaterialTree(box, getAttributes, buttonSelect, buttonDelete);
    });

    buttonDelete.ajaxClick(function(){
        buttonDelete.hide();
        buttonSelect.show();
        buttonDelete.html('');
    });
});



function  fieldMaterialInit(response){
    if (response !== undefined) {
        if (response.table_html !== undefined) {
            s('.field-material-table').html(response.table_html);
        }

        if (response.pager_html !== undefined) {
            s('.table-pager').html(response.pager_html);
        }
    }
    s('.products-table').fixedHeader();
    fieldMaterialInitPager(s('.table-pager'));
}

function fieldMaterialTree(box, getAttributes, btnS, btnD) {

    var obj = s('.field_material_tree');

    fieldMaterialInit();
    s('ul', obj).addClass('tree-root');
    fieldMaterialInitTree(obj);
    fieldMaterialSearch(s('.field_material input#search'));
    fieldMaterialTable(box, getAttributes, btnS, btnD);
}

function fieldMaterialInitPager(pager)
{
    s('a', pager).each(function (link) {
        link.ajaxClick(function (response) {
            //fmLoader.hide();
            fieldMaterialInit(response);
        }, function() {
            // Create generic loader
            //fmLoader.show('Подождите', true);
            return true;
        });
    });
}

/**
 * Asynchronous material search
 * @param searchField Search query
 */
function fieldMaterialSearch(searchField) {
    // Safely get object
    var search = searchField;

    var page = 1;



    // Key up handler
    search.keyup(function(obj, p, e) {
        // If we have not send any search request and this is not Enter character
        if (searchRequest == undefined && e.which != 13) {
            // Reset timeout on key press
            if (searchTimeout != undefined) clearTimeout(searchTimeout);

            // Set delayed function
            searchTimeout = window.setTimeout(function() {
                // Get search input
                var keywords = obj.val();

                if (keywords.length < 2) keywords = '';

                // Disable input
                search.DOMElement.enabled = false;

                // Avoid multiple search requests
                if (!searchInitiated) {
                    // Set flag
                    searchInitiated = true;
                    
                    var temp = s('.structure-element .current').parent();
                    if (temp) {
                        var structureId = s('.structure_id', temp).html();
                        console.log(structureId);
                    }

                    // Show loader with i18n text and black bg
                    //fmLoader.show(s('.loader-text').val(), true);

                    // Perform async request to server for rendering table
                    s.ajax(s('input#search').a('controller') + structureId + '/' + keywords + '/' + page, function(response) {

                        response = JSON.parse(response);
                        //s('.products_tree').html(response.table_html);
                        fieldMaterialInit(response);

                        //fmLoader.hide();

                        // Release flag
                        searchInitiated = false;
                    });
                }

            }, 1000);
        }
    });
}

function fieldMaterialInitTree(tree)
{
    tree.treeview(
        true,
        function(tree) {
            fieldMaterialInitTree(tree);
        }
    );

    if (!tree.hasClass('sjs-treeview')) {
        tree = s('.sjs-treeview', tree);
    }

    s('.open', tree).each(function(link) {
        link.ajaxClick(function(response) {
            s('.icon-structure').html(link.html());
            s('.open').removeClass('current');
            link.addClass('current');
            //fmLoader.hide();
            fieldMaterialInit(response);
        }, function() {
            // Create generic loader
            //fmLoader.show('Подождите', true);
            return true;
        });
    });
}

function fieldMaterialTable(box, getAttributes, buttonSelect, buttonDelete){
    s('.field_material_confirm', box).each(function(item){
        var href = item.a('href');
        href += getAttributes;
        item.a('href', href);
        item.ajaxClick(function(response){
            buttonDelete.html(response.material);
            buttonSelect.hide();
            buttonDelete.show();
            box.close();
        });
    });
}