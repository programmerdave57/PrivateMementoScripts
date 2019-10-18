// Shopping.js

function AssociateShoppingEntryWithProducts( e )
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

function BuyThisProduct( thise )
{
    var lib, e, id, title;

    id = thise.field( "ShoppingListEntryId" );
    title = thise.title;

    lib = libByName("Shopping List" );
    e = lib.findById( id );
    if ( ! e )
    {
      message( "PRODUCT NOT ASSOCIATED WITH A SHOPPING LIST ENTRY!!!" );
    }
    else
    {
      e.set( "Product", title );
      if ( e.field("Disposition") == "Available" )
        e.set("Disposition", "Buy" );
    }
}