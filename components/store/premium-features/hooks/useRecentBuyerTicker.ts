'use client';

import { useState, useEffect } from 'react';
import { StoreSettings, Product, Order } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';
import { getProductsClient } from '@/lib/services/products-client';
import { getOrdersClient } from '@/lib/services/orders-client';

interface UseRecentBuyerTickerProps {
  settings: StoreSettings;
  isCheckout: boolean;
}

export function useRecentBuyerTicker({ settings, isCheckout }: UseRecentBuyerTickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [tickerProduct, setTickerProduct] = useState<Product | null>(null);
  const [tickerBuyer, setTickerBuyer] = useState<{ name: string; city: string } | null>(null);
  const [tickerTime, setTickerTime] = useState('2m ago');
  const [showTicker, setShowTicker] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProductsClient();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products for ticker:', err);
      }
    };
    loadProducts();

    const loadRealOrders = async () => {
      if (settings.recent_buyers_source !== 'real') return;
      try {
        const orderData = await getOrdersClient();
        const validOrders = orderData.filter(o => o.items && o.items.length > 0);
        setRealOrders(validOrders);
      } catch (err) {
        console.error('Failed to load real orders for ticker:', err);
      }
    };
    loadRealOrders();
  }, [settings.recent_buyers_source]);

  // Recent Purchases Ticker Loop
  useEffect(() => {
    if (!isFeatureEnabled(settings, 'recent_buyers') || products.length === 0) return;
    if (isCheckout && settings.recent_buyers_show_on_checkout === false) {
      setShowTicker(false);
      return;
    }

    const runTicker = () => {
      let selectedProduct: Product | null = null;
      let buyerName = '';
      let buyerCity = '';
      let displayTime = '';

      if (settings.recent_buyers_source === 'real' && realOrders.length > 0) {
        const randomOrder = realOrders[Math.floor(Math.random() * realOrders.length)];
        if (randomOrder && randomOrder.items && randomOrder.items.length > 0) {
          const orderItem = randomOrder.items[0];
          selectedProduct = orderItem.product;
          buyerName = randomOrder.customer_name || 'A customer';

          const notesStr = randomOrder.notes || '';
          const cityMatch = notesStr.match(/City:\s*([^\n\r]+)/i);
          buyerCity = cityMatch ? cityMatch[1].trim() : 'Pakistan';

          const createdTime = new Date(randomOrder.created_at).getTime();
          const elapsed = Date.now() - createdTime;
          const mins = Math.floor(elapsed / 60000);
          if (mins < 1) {
            displayTime = 'just now';
          } else if (mins < 60) {
            displayTime = `${mins}m ago`;
          } else {
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) {
              displayTime = `${hrs}h ago`;
            } else {
              displayTime = `${Math.floor(hrs / 24)}d ago`;
            }
          }
        }
      }

      if (!selectedProduct) {
        // Prefer the structured per-row buyer list when populated (full control).
        let structuredRows: { name: string; city: string; product_id?: string; time_ago?: string }[] = [];
        try {
          const raw = settings.recent_buyers as unknown;
          const parsed = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
          if (Array.isArray(parsed)) {
            structuredRows = parsed.filter(
              (r): r is { name: string; city: string; product_id?: string; time_ago?: string } =>
                !!r && typeof r === 'object' && (!!r.name || !!r.city)
            );
          }
        } catch {
          structuredRows = [];
        }

        const pickedRow = structuredRows.length > 0
          ? structuredRows[Math.floor(Math.random() * structuredRows.length)]
          : null;

        // Resolve product: pinned row product first, else pool.
        let pool = products;
        if (pickedRow?.product_id) {
          const pinned = products.find(p => p.id === pickedRow.product_id);
          if (pinned) selectedProduct = pinned;
        }

        if (!selectedProduct) {
          const poolType = settings.recent_buyers_product_pool || 'any';
          if (poolType === 'featured') {
            pool = products.filter(p => p.is_featured);
          } else if (poolType === 'sale') {
            pool = products.filter(p => p.compare_price && p.compare_price > p.price);
          } else if (poolType === 'recent') {
            pool = [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
          } else if (poolType === 'custom') {
            let customIds: string[] = [];
            try {
              customIds = Array.isArray(settings.recent_buyers_custom_products)
                ? settings.recent_buyers_custom_products
                : typeof settings.recent_buyers_custom_products === 'string'
                  ? JSON.parse(settings.recent_buyers_custom_products)
                  : [];
            } catch (e) {
              console.error(e);
            }
            if (customIds.length > 0) {
              pool = products.filter(p => customIds.includes(p.id));
            }
          }

          if (pool.length === 0) pool = products;
          if (pool.length === 0) return;

          selectedProduct = pool[Math.floor(Math.random() * pool.length)];
        }

        if (pickedRow) {
          buyerName = pickedRow.name || 'A buyer';
          buyerCity = pickedRow.city || 'Pakistan';
        } else {
          const names = settings.recent_buyers_names
            ? settings.recent_buyers_names.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
            : ['Ahmad', 'Fatima', 'Zainab', 'Hamza', 'Ayesha', 'Bilal', 'Sana', 'Ali', 'Usman', 'Maryam'];

          const cities = settings.recent_buyers_cities
            ? settings.recent_buyers_cities.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
            : ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

          buyerName = names[Math.floor(Math.random() * names.length)] || 'A buyer';
          buyerCity = cities[Math.floor(Math.random() * cities.length)] || 'Pakistan';
        }

        if (pickedRow?.time_ago && pickedRow.time_ago.trim()) {
          displayTime = pickedRow.time_ago.trim();
        } else {
          const randomMinutes = Math.floor(Math.random() * 59) + 1;
          displayTime = `${randomMinutes}m ago`;
        }
      }

      setTickerProduct(selectedProduct);
      setTickerBuyer({ name: buyerName, city: buyerCity });
      setTickerTime(displayTime);
      setShowTicker(true);

      const displayDuration = (settings.recent_buyers_display_duration ?? 6) * 1000;
      setTimeout(() => {
        setShowTicker(false);
      }, displayDuration);
    };

    const initialDelayVal = (settings.recent_buyers_initial_delay ?? 15) * 1000;
    const intervalVal = (settings.recent_buyers_interval ?? 35) * 1000;

    const initialDelay = setTimeout(() => {
      runTicker();
    }, initialDelayVal);

    const interval = setInterval(() => {
      runTicker();
    }, intervalVal);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [products, realOrders, settings.recent_buyers_enabled, settings.recent_buyers_show_on_checkout, isCheckout, settings.recent_buyers_source, settings.recent_buyers, settings.recent_buyers_names, settings.recent_buyers_cities, settings.recent_buyers_product_pool, settings.recent_buyers_custom_products, settings.recent_buyers_initial_delay, settings.recent_buyers_interval, settings.recent_buyers_display_duration]);

  return {
    tickerProduct,
    tickerBuyer,
    tickerTime,
    showTicker,
    setShowTicker
  };
}
