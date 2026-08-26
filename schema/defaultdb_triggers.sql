DELIMITER //

-- 1. Decrease Stock On Sale
CREATE DEFINER=`avnadmin`@`%` TRIGGER `trg_DecreaseStockOnSale`
AFTER INSERT ON `Order_Items`
FOR EACH ROW
BEGIN
    UPDATE Product
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE product_id = NEW.product_id;
END //

-- 2. Increase Stock On Restock
CREATE DEFINER=`avnadmin`@`%` TRIGGER `trg_IncreaseStockOnRestock`
AFTER INSERT ON `Restock`
FOR EACH ROW
BEGIN
    UPDATE Product
    SET stock_quantity = stock_quantity + NEW.restock_quantity
    WHERE product_id = NEW.product_id;
END //

-- 3. Increase Stock On Sale Delete
CREATE DEFINER=`avnadmin`@`%` TRIGGER `trg_IncreaseStockOnSaleDelete`
AFTER DELETE ON `Order_Items`
FOR EACH ROW
BEGIN
    UPDATE Product
    SET stock_quantity = stock_quantity + OLD.quantity
    WHERE product_id = OLD.product_id;
END //

-- 4. Check Verified Purchase for Reviews
CREATE DEFINER=`avnadmin`@`%` TRIGGER `trg_CheckVerifiedPurchase`
BEFORE INSERT ON `Reviews`
FOR EACH ROW
BEGIN
    DECLARE purchase_count INT;
    
    -- Check if this user has ever ordered this specific product
    SELECT COUNT(*) INTO purchase_count
    FROM Order_Items oi
    JOIN Orders o ON oi.order_id = o.order_id
    WHERE o.consumer_id = NEW.consumer_id
      AND oi.product_id = NEW.product_id;
      
    -- If count is 0, they haven't bought it. Block the review.
    IF purchase_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: You can only review products you have purchased.';
    END IF;
END //

-- 5. Prevent Negative Stock on Update
CREATE DEFINER=`avnadmin`@`%` TRIGGER `trg_PreventNegativeStock`
BEFORE UPDATE ON `Product`
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Stock quantity cannot be negative.';
    END IF;
END //

-- 6. Prevent Negative Stock on Insert
CREATE DEFINER=`avnadmin`@`%` TRIGGER `trg_PreventNegativeStockOnInsert`
BEFORE INSERT ON `Product`
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Initial stock quantity cannot be negative.';
    END IF;
END //

DELIMITER ;
