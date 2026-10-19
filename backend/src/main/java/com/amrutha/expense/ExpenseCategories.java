package com.amrutha.expense;

import com.amrutha.product.BusinessUnit;

import java.util.Collections;
import java.util.List;

/**
 * Standard expense categories for Dairy and Rice operations.
 */
public final class ExpenseCategories {

    private ExpenseCategories() {
    }

    // Dairy Categories
    public static final String CATTLE_FEED = "Cattle feed";
    public static final String ANIMAL_CARE = "Animal care";
    public static final String MILK_PROCUREMENT = "Milk procurement";
    public static final String LABOUR = "Labour";
    public static final String TRANSPORT = "Transport";
    public static final String ELECTRICITY = "Electricity";
    public static final String EQUIPMENT = "Equipment";

    // Rice Categories
    public static final String PADDY_PROCUREMENT = "Paddy procurement";
    public static final String MILLING = "Milling";
    public static final String PACKAGING = "Packaging";
    public static final String STORAGE = "Storage";

    public static final List<String> DAIRY_CATEGORIES = List.of(
            CATTLE_FEED,
            ANIMAL_CARE,
            MILK_PROCUREMENT,
            LABOUR,
            TRANSPORT,
            ELECTRICITY,
            EQUIPMENT
    );

    public static final List<String> RICE_CATEGORIES = List.of(
            PADDY_PROCUREMENT,
            MILLING,
            PACKAGING,
            LABOUR,
            TRANSPORT,
            STORAGE,
            ELECTRICITY
    );

    public static List<String> getCategoriesFor(BusinessUnit businessUnit) {
        if (businessUnit == BusinessUnit.DAIRY) {
            return DAIRY_CATEGORIES;
        } else if (businessUnit == BusinessUnit.RICE) {
            return RICE_CATEGORIES;
        }
        return Collections.emptyList();
    }
}
