# RVRental

#### Database design:

We choose to use MongoDB. Here is the information about our MongoDB data model:

5 Collections: 

* Rvs which record basically the details of each RV. 

* Accounts which record the auth info about the users. For the password, we just record the hash value of the password. We do not store the raw input of the user password to better protect the user privacy.

* Carts which record the item which users save for buying in the future.

* Purchase history records every purchase for every user.

* Wishlist record liked Rv of every user.



#### Languages/frameworks:

HTML, CSS, Javascript, JQuery, Node.js ,E­­­xpress



#### Main function:

* List products and search, filter, paging function

* Shopping cart and its edit feature

* Rv Detail Page

* Admin Function

* User sign up and its validation method

* Order History and Wish List
