% LOGIC PROGRAMMING PARADIGM: facts + rules.
% Node loads facts like:  item(Id, Category, DaysLeft).

:- dynamic(item/3).

% --- status rules ---
status(Id, expired)   :- item(Id, _, D), D < 0.
status(Id, use_today) :- item(Id, _, D), D =:= 0.
status(Id, use_soon)  :- item(Id, _, D), D > 0, D =< 3.
status(Id, fresh)     :- item(Id, _, D), D > 3.

% --- knowledge base ---
perishable(dairy).
perishable(vegetable).
perishable(meat).
perishable(fruit).
perishable(seafood).

% --- priority rules: eat_first(Id, Level) ---
eat_first(Id, urgent) :- status(Id, use_today).
eat_first(Id, high)   :- status(Id, use_soon), item(Id, C, _), perishable(C).
eat_first(Id, medium) :- status(Id, use_soon), item(Id, C, _), \+ perishable(C).
