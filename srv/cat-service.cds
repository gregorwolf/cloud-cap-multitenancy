using { my.bookshop, sap.common } from '../db/data-model';

service CatalogService {
  entity Books @readonly      as projection on bookshop.Books;
  entity Authors @readonly    as projection on bookshop.Authors;
  entity Orders @insertonly   as projection on bookshop.Orders;
  entity CurrenciesViaView    as projection on bookshop.Currencies;
  entity StatesViaView        as projection on bookshop.States;
  entity CurrenciesViaSynonym as projection on bookshop.Currencies_Synonym;
  entity StatesViaSynonym     as projection on bookshop.States_Synonym;
}