import { useState, useRef, useEffect, useCallback } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { productService } from '../../lib/services/productService.js';
import { planService } from '../../lib/services/planService.js';
import { purchaseService } from '../../lib/services/purchaseService.js';
import { discountService } from '../../lib/services/discountService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Package, Layers, CreditCard, CheckCircle, AlertCircle, FileText, Download, X, ArrowLeft, Search, Smartphone, Building2, ChevronRight, Tag, Loader2 } from 'lucide-react';
import { SearchFilter } from '../../components/SearchFilter.jsx';
import { ProductCardSkeleton, GridSkeleton } from '../../components/LoadingSkeleton.jsx';
import { NoProductsFound } from '../../components/EmptyState.jsx';
import { ProductAvatar } from '../../components/ProductAvatar.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';

export default function PortalProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPlans, setProductPlans] = useState([]); // Store plans for selected product
  const [plansLoading, setPlansLoading] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'netbanking'
  const [selectedUPIApp, setSelectedUPIApp] = useState(null);
  const [previewInvoiceNumber, setPreviewInvoiceNumber] = useState('');
  const [paymentData, setPaymentData] = useState({
    // Credit Card
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    // UPI
    upiId: '',
    // Net Banking
    selectedBank: '',
  });

  // UPI Apps list
  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: '🔵', color: 'bg-blue-500' },
    { id: 'phonepe', name: 'PhonePe', icon: '💜', color: 'bg-purple-500' },
    { id: 'paytm', name: 'Paytm', icon: '🔷', color: 'bg-sky-500' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: '🟠', color: 'bg-orange-500' },
    { id: 'bhim', name: 'BHIM UPI', icon: '🟢', color: 'bg-green-600' },
    { id: 'other', name: 'Other UPI', icon: '📱', color: 'bg-gray-500' },
  ];

  // Banks list for Net Banking
  const banks = [
    { id: 'sbi', name: 'State Bank of India', icon: '🏦' },
    { id: 'hdfc', name: 'HDFC Bank', icon: '🏛️' },
    { id: 'icici', name: 'ICICI Bank', icon: '🏦' },
    { id: 'axis', name: 'Axis Bank', icon: '🏛️' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', icon: '🏦' },
    { id: 'pnb', name: 'Punjab National Bank', icon: '🏛️' },
    { id: 'bob', name: 'Bank of Baroda', icon: '🏦' },
    { id: 'canara', name: 'Canara Bank', icon: '🏛️' },
  ];

  // Simulate initial loading
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const result = await productService.getAll();
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter config for products
  const filterConfig = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'SERVICE', label: 'Service' },
        { value: 'SAAS', label: 'SaaS' },
        { value: 'LICENSE', label: 'License' },
      ],
    },
  ];

  const handleFilterChange = useCallback((filtered) => {
    setFilteredProducts(filtered);
  }, []);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Invoice calculation constants
  const GST_PERCENT = 18;
  const PLATFORM_FEE = 99;

  // Calculate invoice amounts with coupon
  const calculateInvoice = (plan, coupon = null) => {
    if (!plan) return null;
    
    const basePrice = Number(plan.price || 0);
    let discountAmount = 0;
    let discountPercent = 0;
    
    if (coupon) {
      if (coupon.type === 'PERCENTAGE') {
        discountPercent = Number(coupon.value);
        discountAmount = (basePrice * discountPercent) / 100;
      } else {
        discountAmount = Math.min(Number(coupon.value), basePrice);
        discountPercent = (discountAmount / basePrice) * 100;
      }
    }
    
    const priceAfterDiscount = basePrice - discountAmount;
    const gstAmount = (priceAfterDiscount * GST_PERCENT) / 100;
    const totalAmount = priceAfterDiscount + gstAmount + PLATFORM_FEE;
    const savedAmount = discountAmount;

    return {
      basePrice,
      discountPercent: Math.round(discountPercent * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      priceAfterDiscount: Math.round(priceAfterDiscount * 100) / 100,
      gstPercent: GST_PERCENT,
      gstAmount: Math.round(gstAmount * 100) / 100,
      platformFee: PLATFORM_FEE,
      totalAmount: Math.round(totalAmount),
      savedAmount: Math.round(savedAmount * 100) / 100,
      couponCode: coupon?.couponCode || null,
      couponName: coupon?.name || null,
    };
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setCouponLoading(true);
    setCouponError('');
    
    const result = await discountService.validateCoupon(
      couponCode.trim(),
      Number(selectedPlan?.price || 0)
    );
    
    if (result.success && result.data) {
      setAppliedCoupon(result.data);
      setCouponError('');
    } else {
      setCouponError(result.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
    
    setCouponLoading(false);
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Load available coupons when invoice preview opens
  useEffect(() => {
    if (isInvoicePreviewOpen) {
      loadAvailableCoupons();
    }
  }, [isInvoicePreviewOpen]);

  const loadAvailableCoupons = async () => {
    const result = await discountService.getAvailableCoupons();
    if (result.success) {
      setAvailableCoupons(result.data);
    }
  };

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    setProductPlans([]);
    setPlansLoading(true);
    setIsPlansModalOpen(true);
    
    try {
      const result = await planService.getAll({ productId: product.id });
      if (result.success && Array.isArray(result.data)) {
        setProductPlans(result.data);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handlePayNow = (plan) => {
    setSelectedPlan(plan);
    setIsPlansModalOpen(false);
    // Reset coupon state
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    // Generate invoice number once when opening the preview
    const timestamp = Date.now();
    setPreviewInvoiceNumber(`INV-${timestamp.toString().slice(-6)}`);
    setIsInvoicePreviewOpen(true);
  };

  const handleContinueToPayment = () => {
    setIsInvoicePreviewOpen(false);
    setIsPaymentModalOpen(true);
    setPaymentStatus(null);
    setPaymentMethod('card');
    setSelectedUPIApp(null);
    setPaymentData({ cardNumber: '', expiry: '', cvv: '', name: '', upiId: '', selectedBank: '' });
  };

  const handleCancelPayment = () => {
    // Only show cancel confirmation if payment is not already successful
    if (paymentStatus !== 'success') {
      setIsCancelConfirmOpen(true);
    }
  };

  const confirmCancelPayment = () => {
    setIsCancelConfirmOpen(false);
    setIsInvoicePreviewOpen(false);
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
    // Reset coupon
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setPaymentStatus(null);
    setPaymentMethod('card');
    setSelectedUPIApp(null);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentStatus('processing');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Call the purchase API with coupon code
      const result = await purchaseService.purchasePlan({
        planId: selectedPlan.id,
        productId: selectedProduct.id,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.couponCode || null,
      });
      
      if (result.success && result.data) {
        // Use breakdown from API response if available, otherwise calculate locally
        const breakdown = result.data.breakdown || calculateInvoice(selectedPlan, appliedCoupon);
        setGeneratedInvoice({ 
          ...result.data.invoice, 
          ...breakdown, 
          plan: selectedPlan, 
          product: selectedProduct 
        });
        setPaymentStatus('success');
      } else {
        console.error('Purchase failed:', result.message);
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Failed to complete purchase:', error);
      setPaymentStatus('error');
    }
  };

  const handleGoToInvoices = () => {
    setIsPaymentModalOpen(false);
    navigate('/portal/invoices');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SERVICE':
        return 'bg-primary/10 text-primary';
      case 'SAAS':
        return 'bg-blue-500/10 text-blue-500';
      case 'LICENSE':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get subscription dates
  const getSubscriptionDates = (plan) => {
    const startDate = new Date();
    const endDate = new Date();
    if (plan?.billingPeriod === 'MONTHLY' || plan?.billingPeriod === 'Monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan?.billingPeriod === 'WEEKLY' || plan?.billingPeriod === 'Weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else if (plan?.billingPeriod === 'DAILY' || plan?.billingPeriod === 'Daily') {
      endDate.setDate(endDate.getDate() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return { startDate, endDate };
  };

  const invoiceCalc = calculateInvoice(selectedPlan, appliedCoupon);
  const subDates = getSubscriptionDates(selectedPlan);

  return (
    <Layout type="portal">
      <PageHeader title="Browse Products" />

      {/* Search and Filter */}
      <div className="mb-6">
        <SearchFilter
          data={products}
          searchFields={['name', 'type']}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          placeholder="Search products by name..."
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <GridSkeleton count={6} CardComponent={ProductCardSkeleton} />
      ) : filteredProducts.length === 0 ? (
        <NoProductsFound onBrowse={() => setFilteredProducts(products)} />
      ) : (
        /* Product Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const plans = product.plans || [];
            const minPrice = plans.length > 0 ? Math.min(...plans.map((p) => Number(p.price || 0))) : Number(product.salesPrice || 0);

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <ProductAvatar product={product} size={44} className="rounded-lg" />
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(product.type)}`}>
                    {product.type}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.type === 'SERVICE' && 'Subscription-based streaming and entertainment service'}
                  {product.type === 'SAAS' && 'Cloud-based software solution with advanced features'}
                  {product.type === 'LICENSE' && 'Premium software license with full access'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Starting from</p>
                    <p className="text-lg font-bold text-foreground">
                      ₹{Math.floor(minPrice).toLocaleString('en-IN')}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    View plans
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription Plans Modal */}
      <Dialog open={isPlansModalOpen} onOpenChange={setIsPlansModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProduct && <ProductAvatar product={selectedProduct} size={28} className="rounded-lg" />}
              {selectedProduct?.name} - Subscription Plans
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {selectedProduct && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a subscription plan that fits your needs. All plans include full access to{' '}
                  {selectedProduct.name}.
                </p>

                <div className="bg-card border border-border rounded-md overflow-hidden">
                  {plansLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : productPlans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No subscription plans available for this product.
                    </div>
                  ) : (
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Plan Name</th>
                          <th>Monthly Price</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Billing</th>
                          <th className="w-28">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productPlans.map((plan) => (
                          <tr key={plan.id}>
                            <td className="font-medium text-foreground">{plan.name}</td>
                            <td className="text-primary font-semibold">₹{Number(plan.price || 0).toLocaleString('en-IN')}</td>
                            <td>{plan.startDate ? formatDate(plan.startDate) : 'N/A'}</td>
                            <td>{plan.endDate ? formatDate(plan.endDate) : 'N/A'}</td>
                            <td>
                              <span className="px-2 py-1 text-xs rounded-full bg-muted">
                                {plan.billingPeriod || 'Monthly'}
                              </span>
                            </td>
                            <td>
                              <Button
                                size="sm"
                                className="h-8 bg-primary hover:bg-primary/90"
                                onClick={() => handlePayNow(plan)}
                              >
                                <CreditCard size={14} className="mr-1" />
                                Subscribe
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={isInvoicePreviewOpen} onOpenChange={setIsInvoicePreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Invoice Preview
            </DialogTitle>
          </DialogHeader>

          {selectedPlan && invoiceCalc && (
            <div className="mt-4">
              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">INVOICE</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="font-mono font-semibold text-foreground">{previewInvoiceNumber}</p>
                    <p className="text-sm text-muted-foreground mt-2">Date</p>
                    <p className="font-medium text-foreground">{formatDate(new Date())}</p>
                  </div>
                </div>
              </div>

              {/* Billing & Shipping Address */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Billing Address
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{user?.name || 'Customer Name'}</p>
                    <p>{user?.email || 'customer@example.com'}</p>
                    <p>123 Business Street</p>
                    <p>Chennai, Tamil Nadu 600001</p>
                    <p>India</p>
                    <p className="mt-2">GSTIN: 33AABCU9603R1ZM</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Shipping Address
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{user?.name || 'Customer Name'}</p>
                    <p>123 Business Street</p>
                    <p>Chennai, Tamil Nadu 600001</p>
                    <p>India</p>
                    <p>Phone: +91 98765 43210</p>
                  </div>
                </div>
              </div>

              {/* Product & Subscription Details */}
              <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">Product & Subscription Details</h3>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3">Description</th>
                        <th className="pb-3 text-center">Qty</th>
                        <th className="pb-3 text-right">Unit Price</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-foreground">{selectedProduct?.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedPlan.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Type: {selectedProduct?.type} | Billing: {selectedPlan.billingPeriod}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 text-center">1</td>
                        <td className="py-4 text-right">{formatCurrency(invoiceCalc.basePrice)}</td>
                        <td className="py-4 text-right font-medium">{formatCurrency(invoiceCalc.basePrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subscription Period */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Subscription Status</p>
                  <p className="font-semibold text-green-600">ACTIVE (Upon Payment)</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                  <p className="font-semibold text-blue-600">{formatDate(subDates.startDate)}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">End Date</p>
                  <p className="font-semibold text-purple-600">{formatDate(subDates.endDate)}</p>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Tag size={16} className="text-primary" />
                    Apply Coupon
                  </h3>
                </div>
                <div className="p-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-400">
                            {appliedCoupon.couponCode}
                          </p>
                          <p className="text-xs text-green-600">
                            {appliedCoupon.name} - {appliedCoupon.type === 'PERCENTAGE' 
                              ? `${appliedCoupon.value}% off` 
                              : `₹${appliedCoupon.value} off`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={16} />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {couponLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {couponError}
                        </p>
                      )}
                      {availableCoupons.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-2">Available Coupons:</p>
                          <div className="flex flex-wrap gap-2">
                            {availableCoupons.slice(0, 3).map((coupon) => (
                              <button
                                key={coupon.id}
                                onClick={() => setCouponCode(coupon.couponCode)}
                                className="px-2 py-1 text-xs bg-muted hover:bg-primary/10 border border-dashed border-primary/50 rounded-md text-primary font-medium transition-colors"
                              >
                                {coupon.couponCode}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">Price Breakdown</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatCurrency(invoiceCalc.basePrice)}</span>
                  </div>
                  {/* Only show discount if coupon is applied */}
                  {appliedCoupon && invoiceCalc.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 flex items-center gap-1">
                          <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                            {appliedCoupon.couponCode}
                          </span>
                          {appliedCoupon.type === 'PERCENTAGE' 
                            ? `-${invoiceCalc.discountPercent}%` 
                            : 'Flat Off'}
                        </span>
                        <span className="text-green-600">-{formatCurrency(invoiceCalc.discountAmount)}</span>
                      </div>
                      <div className="border-t border-dashed border-border pt-3 flex justify-between text-sm">
                        <span className="text-muted-foreground">Price After Discount</span>
                        <span className="text-foreground font-medium">{formatCurrency(invoiceCalc.priceAfterDiscount)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="text-foreground">{formatCurrency(invoiceCalc.platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      GST ({invoiceCalc.gstPercent}%)
                      <span className="text-xs ml-1">(CGST 9% + SGST 9%)</span>
                    </span>
                    <span className="text-foreground">{formatCurrency(invoiceCalc.gstAmount)}</span>
                  </div>
                  <div className="border-t-2 border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total Amount Payable</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(invoiceCalc.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Savings Summary */}
              {appliedCoupon && invoiceCalc.savedAmount > 0 ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Original Price</p>
                    <p className="text-lg line-through text-muted-foreground">{formatCurrency(invoiceCalc.basePrice)}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm text-green-600 font-medium">You Save</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(invoiceCalc.savedAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">You Pay</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(invoiceCalc.totalAmount)}</p>
                  </div>
                </div>
              </div>
              ) : (
              <div className="bg-muted/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-center text-muted-foreground">
                  💡 Apply a coupon code above to get a discount on your purchase!
                </p>
              </div>
              )}

              {/* Terms & Conditions */}
              <div className="text-xs text-muted-foreground mb-6 p-3 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-1">Terms & Conditions:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Subscription will be activated immediately upon successful payment.</li>
                  <li>Refunds are subject to our cancellation policy.</li>
                  <li>GST is calculated as per Indian tax regulations.</li>
                  <li>This is a computer-generated invoice preview.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelPayment}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleContinueToPayment}
                >
                  <CreditCard size={16} className="mr-2" />
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              Cancel Payment?
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-muted-foreground mb-6">
              Are you sure you want to cancel this payment? Your subscription will not be activated and you will need to start over.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCancelConfirmOpen(false)}
              >
                <ArrowLeft size={16} className="mr-2" />
                Go Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmCancelPayment}
              >
                <X size={16} className="mr-2" />
                Yes, Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        if (!open && paymentStatus !== 'processing' && paymentStatus !== 'success') {
          handleCancelPayment();
        } else if (!open && paymentStatus === 'success') {
          // Close without cancel confirmation after successful payment
          setIsPaymentModalOpen(false);
          setSelectedPlan(null);
          setPaymentStatus(null);
          setPaymentMethod('card');
          setSelectedUPIApp(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Gateway
            </DialogTitle>
          </DialogHeader>

          {paymentStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Payment Successful! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Your subscription has been activated successfully.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Invoice <span className="font-mono font-semibold">{generatedInvoice?.number}</span> has been generated.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(generatedInvoice?.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium text-foreground capitalize">
                    {paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'netbanking' ? 'Net Banking' : 'Credit Card'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subscription:</span>
                  <span className="font-medium text-foreground">{selectedPlan?.name}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGoToInvoices}
                >
                  <FileText size={16} className="mr-2" />
                  View My Invoices
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/portal/subscriptions')}
                >
                  View Subscriptions
                </Button>
              </div>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Payment Failed</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We couldn't process your payment. Please check your details and try again.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={confirmCancelPayment}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => setPaymentStatus(null)}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4">
              {/* Order Summary */}
              {selectedPlan && invoiceCalc && (
                <div className="p-4 bg-muted/50 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Paying for:</p>
                      <p className="font-semibold text-foreground">{selectedPlan.name}</p>
                    </div>
                    {appliedCoupon && invoiceCalc.discountPercent > 0 && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full">
                        {invoiceCalc.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-primary">{formatCurrency(invoiceCalc.totalAmount)}</span>
                    {appliedCoupon && invoiceCalc.savedAmount > 0 && (
                      <span className="text-sm line-through text-muted-foreground">{formatCurrency(invoiceCalc.basePrice)}</span>
                    )}
                  </div>
                  {appliedCoupon && invoiceCalc.savedAmount > 0 && (
                    <p className="text-xs text-green-600 mt-1">You save {formatCurrency(invoiceCalc.savedAmount)}!</p>
                  )}
                </div>
              )}

              {/* Payment Method Tabs */}
              <div className="flex rounded-lg border border-border p-1 bg-muted/30">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    paymentMethod === 'upi'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setPaymentMethod('upi')}
                  disabled={paymentStatus === 'processing'}
                >
                  <Smartphone className="w-4 h-4" />
                  UPI
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    paymentMethod === 'card'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                  disabled={paymentStatus === 'processing'}
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    paymentMethod === 'netbanking'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setPaymentMethod('netbanking')}
                  disabled={paymentStatus === 'processing'}
                >
                  <Building2 className="w-4 h-4" />
                  Net Banking
                </button>
              </div>

              {/* UPI Payment Section */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Select your preferred UPI app:</p>
                  
                  {/* UPI Apps Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {upiApps.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                          selectedUPIApp === app.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedUPIApp(app.id)}
                        disabled={paymentStatus === 'processing'}
                      >
                        <span className="text-2xl">{app.icon}</span>
                        <span className="text-xs font-medium text-foreground">{app.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* UPI ID Input */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      UPI ID {selectedUPIApp === 'other' ? '(Required)' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={paymentData.upiId}
                      onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                      required={selectedUPIApp === 'other'}
                      disabled={paymentStatus === 'processing'}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedUPIApp && selectedUPIApp !== 'other' 
                        ? `You'll be redirected to ${upiApps.find(a => a.id === selectedUPIApp)?.name} to complete payment`
                        : 'Enter your UPI ID to receive payment request'}
                    </p>
                  </div>
                </div>
              )}

              {/* Credit Card Payment Section */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={paymentData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                        setPaymentData({ ...paymentData, cardNumber: value });
                      }}
                      required
                      disabled={paymentStatus === 'processing'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={paymentData.expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2);
                          }
                          setPaymentData({ ...paymentData, expiry: value });
                        }}
                        required
                        disabled={paymentStatus === 'processing'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                        required
                        disabled={paymentStatus === 'processing'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={paymentData.name}
                      onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                      required
                      disabled={paymentStatus === 'processing'}
                    />
                  </div>

                  {/* Card Type Indicators */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">We accept:</span>
                    <div className="flex gap-1.5">
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded font-medium">VISA</span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 rounded font-medium">Mastercard</span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded font-medium">RuPay</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Payment Section */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Select your bank:</p>
                  
                  {/* Popular Banks */}
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {banks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          paymentData.selectedBank === bank.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => setPaymentData({ ...paymentData, selectedBank: bank.id })}
                        disabled={paymentStatus === 'processing'}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{bank.icon}</span>
                          <span className="font-medium text-foreground">{bank.name}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors ${
                          paymentData.selectedBank === bank.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    You'll be redirected to your bank's secure payment page to complete the transaction.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelPayment}
                  disabled={paymentStatus === 'processing'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={
                    paymentStatus === 'processing' ||
                    (paymentMethod === 'upi' && !selectedUPIApp) ||
                    (paymentMethod === 'netbanking' && !paymentData.selectedBank)
                  }
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'upi' && <Smartphone size={16} className="mr-2" />}
                      {paymentMethod === 'card' && <CreditCard size={16} className="mr-2" />}
                      {paymentMethod === 'netbanking' && <Building2 size={16} className="mr-2" />}
                      Pay {formatCurrency(invoiceCalc?.totalAmount || 0)}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Your payment is secured with 256-bit SSL encryption
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
