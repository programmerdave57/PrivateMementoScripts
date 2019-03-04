// Shopping.js

function
 AssociateShoppingEntryWithProducts( e )
{
    var id, prods, prod, count, i;

    id = e.id;
    prods = e.field( "Products" );
    count = prods.length;
    for ( i=0; i<count; i++ )
    {
        prod = prods[i];
        prod.set( "ShoppingListEntryId", id );
    }
}
