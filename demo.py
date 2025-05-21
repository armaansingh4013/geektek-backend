import frappe
from frappe.model.naming import make_autoname
from erpnext.selling.doctype.sales_order.sales_order import make_sales_invoice
from erpnext.controllers.accounts_controller import get_taxes_and_charges
import math


def on_submit(doc, method):
    create_sales_invoice_from_sales_order(doc)
    if doc.custom_table_no:
        update_table_status(doc)


def create_sales_invoice_from_sales_order(doc):
    if doc.custom_source == "WEB":
        return
    sales_invoice = make_sales_invoice(doc.name, ignore_permissions=1)
    sales_invoice.update_stock = 1
    sales_invoice.posting_date = doc.transaction_date
    sales_invoice.posting_time = doc.transaction_time
    sales_invoice.due_date = doc.transaction_date
    
    if doc.custom_redeem_loyalty_points:
        sales_invoice.update({
            "redeem_loyalty_points": doc.custom_redeem_loyalty_points,
            "loyalty_points": doc.loyalty_points,
            "loyalty_amount": doc.loyalty_amount,
            "loyalty_program": doc.custom_loyalty_program,
            "loyalty_redemption_account": doc.custom_redemption_account,
        })
    if doc.coupon_code:
        sales_invoice.coupon_code = doc.coupon_code

    sales_invoice.save(ignore_permissions=1)
    sales_invoice.submit()


def update_table_status(doc):
    for table in  doc.custom_table_no.split(","):
        frappe.db.set_value("Table List", table, "status", "Unavailable")

def validate(doc,method):
    grand_total = 0
    for item in doc.items:
        parent_item = item.item_code
        if not item.custom_is_attribute_item:
            parent_item = item.item_code
            price_data = frappe.get_all(
           	                "Item Price",
            	            filters={
                	                "item_code": item.item_code,
                	                "selling": 1
            	                    },
            	            fields=["custom_rate_including_vat"],
            		        order_by="creation desc",
                            limit=1
        	                )
            price_incl_vat = 0.0
            if price_data and price_data[0].custom_rate_including_vat is not None:
            	price_incl_vat = float(price_data[0].custom_rate_including_vat) if price_data and price_data[0].custom_rate_including_vat else 0.0
       
        else:
            price_data = frappe.get_all(
           	 "Attribute Items",
            	filters={
                	"parent": parent_item,
                	"item_name":item.item_code
            	},
            	fields=["price_including_vat"],
            		order_by="creation desc",
            	limit=1
        	    )
            price_incl_vat = 0.0
            if price_data and price_data[0].price_including_vat is not None:
            	price_incl_vat = float(price_data[0].price_including_vat) if price_data and price_data[0].price_including_vat else 0.0
            
        grand_total += price_incl_vat * float(item.qty or 0)

    # Set custom field for grand total including VAT
    doc.grand_total = round(grand_total, 2)  # assumes custom field exists

    # Calculate difference
    diff = round(grand_total - doc.base_total, 2)
	
    # Adjust first item's tax_amount or custom field
    if doc.taxes:
        doc.taxes[0].tax_amount = diff
        doc.taxes[0].account_currency = diff
        doc.taxes[0].total = grand_total
        doc.taxes[0].base_total = grand_total
        doc.total_taxes_and_charges = diff
        doc.base_total_taxes_and_charges = diff




    if doc.docstatus == 0 and not doc.status:
        doc.status = "Failed"

    # If Paid (assuming payment_status is a custom field)
    if doc.get("custom_payment_status") == "Paid":
        doc.custom_status = "Success"
    if doc.coupon_code:
        code = doc.coupon_code
        coupon_code = frappe.qb.DocType('Coupon Code') 
        pricing_rule = frappe.qb.DocType('Pricing Rule')

        conditions = (
                (pricing_rule.apply_on == 'Transaction')
                & (pricing_rule.rate_or_discount == 'Discount Percentage')
                & (pricing_rule.apply_discount_on == 'Grand Total')
                & (pricing_rule.price_or_product_discount == "Price")
        )

        if code:
                conditions &= (coupon_code.coupon_code == code)

        coupon_code =(
        frappe.qb.from_(coupon_code).inner_join(pricing_rule) .on(coupon_code.pricing_rule == pricing_rule.name) 
        .select(coupon_code.name , coupon_code.coupon_code, coupon_code.pricing_rule,
        coupon_code.maximum_use, coupon_code.used, coupon_code.description, 
        pricing_rule.valid_from , pricing_rule.valid_upto, pricing_rule.apply_on, 
        pricing_rule.price_or_product_discount, pricing_rule.min_qty,
        pricing_rule.max_qty, pricing_rule.min_amt, pricing_rule.max_amt, 
        pricing_rule.rate_or_discount, pricing_rule.apply_discount_on, 
        pricing_rule.discount_amount, pricing_rule.rate, pricing_rule.discount_percentage )
        .where( conditions
        )
        ).run(as_dict=1)
        frappe.log_error(f"inside validate {coupon_code[0].discount_percentage}")
        doc.additional_discount_percentage = coupon_code[0].discount_percentage
        discount_amount = (doc.total*coupon_code[0].discount_percentage)/100
        doc.discount_amount = discount_amount
        doc.grand_total =int(( doc.grand_total- discount_amount)*100)/100