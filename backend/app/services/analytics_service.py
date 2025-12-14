"""Analytics service for dashboard statistics and metrics."""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from supabase import Client
from app.database import get_supabase_client


class AnalyticsService:
    """Service for analytics and statistics calculations."""
    
    def __init__(self, db: Optional[Client] = None):
        """Initialize analytics service."""
        self.db = db or get_supabase_client()
    
    def get_dashboard_stats(self) -> Dict:
        """
        Get main dashboard statistics.
        
        Returns:
            Dictionary with dashboard statistics
        """
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        year_start = today_start.replace(month=1, day=1)
        
        # Total revenue
        total_revenue = self._get_total_revenue()
        today_revenue = self._get_revenue_for_period(today_start, now)
        week_revenue = self._get_revenue_for_period(week_start, now)
        month_revenue = self._get_revenue_for_period(month_start, now)
        year_revenue = self._get_revenue_for_period(year_start, now)
        
        # Order counts
        total_orders = self._get_order_count()
        today_orders = self._get_order_count_for_period(today_start, now)
        week_orders = self._get_order_count_for_period(week_start, now)
        month_orders = self._get_order_count_for_period(month_start, now)
        
        # Order status distribution
        order_status_dist = self._get_order_status_distribution()
        
        # User statistics
        total_users = self._get_user_count()
        new_users_today = self._get_user_count_for_period(today_start, now)
        new_users_week = self._get_user_count_for_period(week_start, now)
        new_users_month = self._get_user_count_for_period(month_start, now)
        
        # Product statistics
        total_products = self._get_product_count()
        active_products = self._get_active_product_count()
        low_stock_products = self._get_low_stock_product_count()
        out_of_stock_products = self._get_out_of_stock_product_count()
        
        # Payment method distribution
        payment_method_dist = self._get_payment_method_distribution()
        
        return {
            "revenue": {
                "total": float(total_revenue),
                "today": float(today_revenue),
                "week": float(week_revenue),
                "month": float(month_revenue),
                "year": float(year_revenue)
            },
            "orders": {
                "total": total_orders,
                "today": today_orders,
                "week": week_orders,
                "month": month_orders,
                "by_status": order_status_dist
            },
            "users": {
                "total": total_users,
                "new_today": new_users_today,
                "new_week": new_users_week,
                "new_month": new_users_month
            },
            "products": {
                "total": total_products,
                "active": active_products,
                "low_stock": low_stock_products,
                "out_of_stock": out_of_stock_products
            },
            "payment_methods": payment_method_dist
        }
    
    def get_revenue_stats(self, period: str = "month") -> Dict:
        """
        Get revenue statistics for a period.
        
        Args:
            period: Period type (day, week, month, year)
            
        Returns:
            Revenue statistics
        """
        now = datetime.utcnow()
        
        if period == "day":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            interval = "hour"
            points = 24
        elif period == "week":
            start = now - timedelta(days=7)
            interval = "day"
            points = 7
        elif period == "month":
            start = now - timedelta(days=30)
            interval = "day"
            points = 30
        elif period == "year":
            start = now.replace(month=1, day=1)
            interval = "month"
            points = 12
        else:
            start = now - timedelta(days=30)
            interval = "day"
            points = 30
        
        # Get revenue trend
        trend = self._get_revenue_trend(start, now, interval, points)
        
        # Calculate growth
        if len(trend) >= 2:
            current = trend[-1]["revenue"]
            previous = trend[-2]["revenue"]
            growth = ((current - previous) / previous * 100) if previous > 0 else 0
        else:
            growth = 0
        
        return {
            "period": period,
            "total_revenue": float(self._get_revenue_for_period(start, now)),
            "growth_percentage": growth,
            "trend": trend
        }
    
    def get_order_analytics(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict:
        """
        Get order analytics.
        
        Args:
            start_date: Start date (default: 30 days ago)
            end_date: End date (default: now)
            
        Returns:
            Order analytics
        """
        if not end_date:
            end_date = datetime.utcnow()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Get orders in period
        orders = self._get_orders_for_period(start_date, end_date)
        
        # Calculate metrics
        total_orders = len(orders)
        total_revenue = sum(Decimal(str(o["total"])) for o in orders)
        average_order_value = float(total_revenue / total_orders) if total_orders > 0 else 0
        
        # Status breakdown
        status_breakdown = {}
        for order in orders:
            status = order["status"]
            status_breakdown[status] = status_breakdown.get(status, 0) + 1
        
        # Payment status breakdown
        payment_status_breakdown = {}
        for order in orders:
            payment_status = order["payment_status"]
            payment_status_breakdown[payment_status] = payment_status_breakdown.get(payment_status, 0) + 1
        
        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "average_order_value": average_order_value,
            "status_breakdown": status_breakdown,
            "payment_status_breakdown": payment_status_breakdown
        }
    
    def get_product_analytics(self) -> Dict:
        """
        Get product analytics.
        
        Returns:
            Product analytics
        """
        # Get top products by sales
        top_products = self._get_top_products_by_sales(limit=10)
        
        # Get products by category
        products_by_category = self._get_products_by_category()
        
        # Stock alerts
        low_stock = self._get_low_stock_products()
        out_of_stock = self._get_out_of_stock_products()
        
        return {
            "top_products": top_products,
            "by_category": products_by_category,
            "stock_alerts": {
                "low_stock": low_stock,
                "out_of_stock": out_of_stock
            }
        }
    
    def get_user_analytics(self) -> Dict:
        """
        Get user analytics.
        
        Returns:
            User analytics
        """
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        # User growth
        total_users = self._get_user_count()
        new_today = self._get_user_count_for_period(today_start, now)
        new_week = self._get_user_count_for_period(week_start, now)
        new_month = self._get_user_count_for_period(month_start, now)
        
        # Top customers by revenue
        top_customers = self._get_top_customers_by_revenue(limit=10)
        
        # User role distribution
        role_distribution = self._get_user_role_distribution()
        
        return {
            "total_users": total_users,
            "new_users": {
                "today": new_today,
                "week": new_week,
                "month": new_month
            },
            "top_customers": top_customers,
            "role_distribution": role_distribution
        }
    
    def get_trends(self, metric: str, period: str = "month") -> List[Dict]:
        """
        Get trend data for charts.
        
        Args:
            metric: Metric type (revenue, orders, users)
            period: Period type (day, week, month, year)
            
        Returns:
            List of trend points
        """
        now = datetime.utcnow()
        
        if period == "day":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            interval = "hour"
        elif period == "week":
            start = now - timedelta(days=7)
            interval = "day"
        elif period == "month":
            start = now - timedelta(days=30)
            interval = "day"
        elif period == "year":
            start = now.replace(month=1, day=1)
            interval = "month"
        else:
            start = now - timedelta(days=30)
            interval = "day"
        
        if metric == "revenue":
            return self._get_revenue_trend(start, now, interval, 30)
        elif metric == "orders":
            return self._get_order_trend(start, now, interval, 30)
        elif metric == "users":
            return self._get_user_trend(start, now, interval, 30)
        else:
            return []
    
    # Private helper methods
    
    def _get_total_revenue(self) -> Decimal:
        """Get total revenue from all paid orders."""
        response = self.db.table("orders").select("total").eq(
            "payment_status", "paid"
        ).execute()
        
        return sum(Decimal(str(o["total"])) for o in (response.data or []))
    
    def _get_revenue_for_period(self, start: datetime, end: datetime) -> Decimal:
        """Get revenue for a specific period."""
        response = self.db.table("orders").select("total").eq(
            "payment_status", "paid"
        ).gte("created_at", start.isoformat()).lte("created_at", end.isoformat()).execute()
        
        return sum(Decimal(str(o["total"])) for o in (response.data or []))
    
    def _get_order_count(self) -> int:
        """Get total order count."""
        response = self.db.table("orders").select("id", count="exact").execute()
        return response.count or 0
    
    def _get_order_count_for_period(self, start: datetime, end: datetime) -> int:
        """Get order count for period."""
        response = self.db.table("orders").select("id", count="exact").gte(
            "created_at", start.isoformat()
        ).lte("created_at", end.isoformat()).execute()
        return response.count or 0
    
    def _get_order_status_distribution(self) -> Dict[str, int]:
        """Get order status distribution."""
        response = self.db.table("orders").select("status").execute()
        
        distribution = {}
        for order in (response.data or []):
            status = order["status"]
            distribution[status] = distribution.get(status, 0) + 1
        
        return distribution
    
    def _get_payment_method_distribution(self) -> Dict[str, int]:
        """Get payment method distribution."""
        response = self.db.table("orders").select("payment_method").execute()
        
        distribution = {}
        for order in (response.data or []):
            method = order.get("payment_method") or "unknown"
            distribution[method] = distribution.get(method, 0) + 1
        
        return distribution
    
    def _get_user_count(self) -> int:
        """Get total user count."""
        response = self.db.table("user_profiles").select("id", count="exact").execute()
        return response.count or 0
    
    def _get_user_count_for_period(self, start: datetime, end: datetime) -> int:
        """Get user count for period."""
        response = self.db.table("user_profiles").select("id", count="exact").gte(
            "created_at", start.isoformat()
        ).lte("created_at", end.isoformat()).execute()
        return response.count or 0
    
    def _get_product_count(self) -> int:
        """Get total product count."""
        response = self.db.table("products").select("id", count="exact").is_(
            "deleted_at", "null"
        ).execute()
        return response.count or 0
    
    def _get_active_product_count(self) -> int:
        """Get active product count."""
        response = self.db.table("products").select("id", count="exact").eq(
            "is_active", True
        ).is_("deleted_at", "null").execute()
        return response.count or 0
    
    def _get_low_stock_product_count(self) -> int:
        """Get low stock product count."""
        response = self.db.table("products").select("id").eq(
            "is_active", True
        ).is_("deleted_at", "null").execute()
        
        count = 0
        for product in (response.data or []):
            stock = product.get("stock", 0)
            threshold = product.get("low_stock_threshold", 5)
            if 0 < stock <= threshold:
                count += 1
        
        return count
    
    def _get_out_of_stock_product_count(self) -> int:
        """Get out of stock product count."""
        response = self.db.table("products").select("id", count="exact").eq(
            "is_active", True
        ).eq("stock", 0).is_("deleted_at", "null").execute()
        return response.count or 0
    
    def _get_revenue_trend(self, start: datetime, end: datetime, interval: str, points: int) -> List[Dict]:
        """Get revenue trend data."""
        # This is a simplified version - in production, you'd use SQL date_trunc
        orders = self._get_orders_for_period(start, end, payment_status="paid")
        
        # Group by interval (simplified - would use SQL in production)
        trend_map = {}
        for order in orders:
            created_at = datetime.fromisoformat(order["created_at"].replace("Z", "+00:00"))
            
            if interval == "hour":
                key = created_at.strftime("%Y-%m-%d %H:00")
            elif interval == "day":
                key = created_at.strftime("%Y-%m-%d")
            elif interval == "month":
                key = created_at.strftime("%Y-%m")
            else:
                key = created_at.strftime("%Y-%m-%d")
            
            if key not in trend_map:
                trend_map[key] = Decimal("0")
            trend_map[key] += Decimal(str(order["total"]))
        
        # Convert to list
        trend = []
        for key in sorted(trend_map.keys()):
            trend.append({
                "date": key,
                "revenue": float(trend_map[key])
            })
        
        return trend
    
    def _get_order_trend(self, start: datetime, end: datetime, interval: str, points: int) -> List[Dict]:
        """Get order count trend data."""
        orders = self._get_orders_for_period(start, end)
        
        # Group by interval
        trend_map = {}
        for order in orders:
            created_at = datetime.fromisoformat(order["created_at"].replace("Z", "+00:00"))
            
            if interval == "hour":
                key = created_at.strftime("%Y-%m-%d %H:00")
            elif interval == "day":
                key = created_at.strftime("%Y-%m-%d")
            elif interval == "month":
                key = created_at.strftime("%Y-%m")
            else:
                key = created_at.strftime("%Y-%m-%d")
            
            trend_map[key] = trend_map.get(key, 0) + 1
        
        # Convert to list
        trend = []
        for key in sorted(trend_map.keys()):
            trend.append({
                "date": key,
                "count": trend_map[key]
            })
        
        return trend
    
    def _get_user_trend(self, start: datetime, end: datetime, interval: str, points: int) -> List[Dict]:
        """Get user count trend data."""
        response = self.db.table("user_profiles").select("created_at").gte(
            "created_at", start.isoformat()
        ).lte("created_at", end.isoformat()).execute()
        
        # Group by interval
        trend_map = {}
        for user in (response.data or []):
            created_at = datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
            
            if interval == "hour":
                key = created_at.strftime("%Y-%m-%d %H:00")
            elif interval == "day":
                key = created_at.strftime("%Y-%m-%d")
            elif interval == "month":
                key = created_at.strftime("%Y-%m")
            else:
                key = created_at.strftime("%Y-%m-%d")
            
            trend_map[key] = trend_map.get(key, 0) + 1
        
        # Convert to list
        trend = []
        for key in sorted(trend_map.keys()):
            trend.append({
                "date": key,
                "count": trend_map[key]
            })
        
        return trend
    
    def _get_orders_for_period(self, start: datetime, end: datetime, payment_status: Optional[str] = None) -> List[Dict]:
        """Get orders for period."""
        query = self.db.table("orders").select("*").gte(
            "created_at", start.isoformat()
        ).lte("created_at", end.isoformat())
        
        if payment_status:
            query = query.eq("payment_status", payment_status)
        
        response = query.execute()
        return response.data or []
    
    def _get_top_products_by_sales(self, limit: int = 10) -> List[Dict]:
        """Get top products by sales."""
        # Get order items with product info
        response = self.db.table("order_items").select(
            """
            product_id,
            quantity,
            price,
            products:product_id (
                name,
                sku
            )
            """
        ).execute()
        
        # Aggregate by product
        product_sales = {}
        for item in (response.data or []):
            product_id = item["product_id"]
            product = item.get("products", {})
            
            if product_id not in product_sales:
                product_sales[product_id] = {
                    "product_id": product_id,
                    "name": product.get("name", "Unknown"),
                    "sku": product.get("sku", ""),
                    "total_quantity": 0,
                    "total_revenue": Decimal("0")
                }
            
            product_sales[product_id]["total_quantity"] += item["quantity"]
            product_sales[product_id]["total_revenue"] += Decimal(str(item["price"])) * item["quantity"]
        
        # Sort by revenue and return top N
        sorted_products = sorted(
            product_sales.values(),
            key=lambda x: x["total_revenue"],
            reverse=True
        )
        
        # Convert Decimal to float for JSON serialization
        result = []
        for product in sorted_products[:limit]:
            product["total_revenue"] = float(product["total_revenue"])
            result.append(product)
        
        return result
    
    def _get_products_by_category(self) -> Dict[str, int]:
        """Get product count by category."""
        response = self.db.table("products").select(
            """
            category_id,
            categories:category_id (
                name
            )
            """
        ).eq("is_active", True).is_("deleted_at", "null").execute()
        
        category_counts = {}
        for product in (response.data or []):
            category = product.get("categories", {})
            category_name = category.get("name", "Uncategorized") if category else "Uncategorized"
            category_counts[category_name] = category_counts.get(category_name, 0) + 1
        
        return category_counts
    
    def _get_low_stock_products(self) -> List[Dict]:
        """Get low stock products."""
        response = self.db.table("products").select("*").eq(
            "is_active", True
        ).is_("deleted_at", "null").execute()
        
        low_stock = []
        for product in (response.data or []):
            stock = product.get("stock", 0)
            threshold = product.get("low_stock_threshold", 5)
            if 0 < stock <= threshold:
                low_stock.append({
                    "id": product["id"],
                    "name": product["name"],
                    "sku": product["sku"],
                    "stock": stock,
                    "threshold": threshold
                })
        
        return low_stock
    
    def _get_out_of_stock_products(self) -> List[Dict]:
        """Get out of stock products."""
        response = self.db.table("products").select("*").eq(
            "is_active", True
        ).eq("stock", 0).is_("deleted_at", "null").execute()
        
        return [
            {
                "id": p["id"],
                "name": p["name"],
                "sku": p["sku"],
                "stock": 0
            }
            for p in (response.data or [])
        ]
    
    def _get_top_customers_by_revenue(self, limit: int = 10) -> List[Dict]:
        """Get top customers by revenue."""
        # Get orders with user info
        response = self.db.table("orders").select(
            """
            user_id,
            total,
            user_profiles:user_id (
                name,
                email
            )
            """
        ).eq("payment_status", "paid").execute()
        
        # Aggregate by user
        customer_revenue = {}
        for order in (response.data or []):
            user_id = order.get("user_id")
            if not user_id:
                continue
            
            user_profile = order.get("user_profiles", {})
            
            if user_id not in customer_revenue:
                customer_revenue[user_id] = {
                    "user_id": user_id,
                    "name": user_profile.get("name", "Guest") if user_profile else "Guest",
                    "email": user_profile.get("email", "") if user_profile else "",
                    "total_revenue": Decimal("0"),
                    "order_count": 0
                }
            
            customer_revenue[user_id]["total_revenue"] += Decimal(str(order["total"]))
            customer_revenue[user_id]["order_count"] += 1
        
        # Sort by revenue and return top N
        sorted_customers = sorted(
            customer_revenue.values(),
            key=lambda x: x["total_revenue"],
            reverse=True
        )
        
        # Convert Decimal to float
        result = []
        for customer in sorted_customers[:limit]:
            customer["total_revenue"] = float(customer["total_revenue"])
            result.append(customer)
        
        return result
    
    def _get_user_role_distribution(self) -> Dict[str, int]:
        """Get user role distribution."""
        response = self.db.table("user_profiles").select("role").execute()
        
        distribution = {}
        for profile in (response.data or []):
            role = profile.get("role", "customer")
            distribution[role] = distribution.get(role, 0) + 1
        
        return distribution
