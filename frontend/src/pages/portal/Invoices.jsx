import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { invoiceService } from '../../lib/services/invoiceService.js';
import { InvoiceStatus } from '../../data/constants.js';
import { Receipt, Download, CreditCard, CheckCircle, Clock, FileText, X, Printer } from 'lucide-react';
import { SearchFilter } from '../../components/SearchFilter.jsx';
import { StatsCardSkeleton, CardSkeleton } from '../../components/LoadingSkeleton.jsx';
import { NoInvoices, NoSearchResults } from '../../components/EmptyState.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';

export default function PortalInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const result = await invoiceService.getAll();
      if (result.success && Array.isArray(result.data)) {
        setInvoices(result.data);
        setFilteredInvoices(result.data);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enrich invoices with additional data for filtering
  const enrichedInvoices = invoices.map(inv => {
    const subscription = inv.subscription;
    const plan = subscription?.plan;
    const product = subscription?.lines?.[0]?.product;
    return {
      ...inv,
      planName: plan?.name || 'Unknown',
      productName: product?.name || 'Unknown',
      productType: product?.type || 'Unknown',
    };
  });

  // Filter config
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: InvoiceStatus.PAID, label: 'Paid' },
        { value: InvoiceStatus.DRAFT, label: 'Draft' },
      ],
    },
  ];

  const handleFilterChange = useCallback((filtered) => {
    setFilteredInvoices(filtered);
  }, []);

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const pendingCount = invoices.filter((inv) => inv.status !== InvoiceStatus.PAID).length;

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyDisplay = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Calculate invoice breakdown from invoice data or estimate
  const calculateBreakdown = (invoice) => {
    // If invoice has stored discount/tax info, use it
    if (invoice.subtotal !== undefined && invoice.subtotal !== null) {
      const basePrice = Number(invoice.subtotal || 0);
      const discountAmount = Number(invoice.discountTotal || 0);
      const discountPercent = Number(invoice.discountPercent || 0);
      const taxAmount = Number(invoice.taxTotal || 0);
      const taxPercent = Number(invoice.taxPercent || 18);
      const platformFee = Number(invoice.platformFee || 99);
      const total = Number(invoice.total || 0);
      const priceAfterDiscount = basePrice - discountAmount;
      
      return {
        basePrice,
        discountPercent,
        discountAmount,
        priceAfterDiscount,
        gstPercent: taxPercent,
        gstAmount: taxAmount,
        platformFee,
        totalAmount: total,
        couponCode: invoice.couponCode || null,
      };
    }
    
    // Fallback: estimate breakdown from total (legacy invoices)
    const total = Number(invoice.total || invoice || 0);
    const withoutPlatformFee = total - 99;
    const priceAfterDiscount = withoutPlatformFee / 1.18;
    const basePrice = priceAfterDiscount;
    const discountAmount = 0;
    const gstAmount = priceAfterDiscount * 0.18;
    
    return {
      basePrice: Math.round(basePrice),
      discountPercent: 0,
      discountAmount: Math.round(discountAmount),
      priceAfterDiscount: Math.round(priceAfterDiscount),
      gstPercent: 18,
      gstAmount: Math.round(gstAmount),
      platformFee: 99,
      totalAmount: total,
      couponCode: null,
    };
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadInvoice = (invoice) => {
    const subscription = invoice.subscription;
    const plan = subscription?.plan;
    const product = subscription?.lines?.[0]?.product;
    const breakdown = calculateBreakdown(invoice);

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Helper function for centered text
    const centerText = (text, yPos) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, yPos);
    };

    // Header
    doc.setFillColor(124, 58, 237); // Primary purple color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    centerText('TAX INVOICE', 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    centerText('SubsManager - Subscription Management Platform', 35);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    y = 55;

    // Invoice Details Box
    doc.setFillColor(249, 250, 251);
    doc.rect(14, y - 5, pageWidth - 28, 35, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(14, y - 5, pageWidth - 28, 35, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', 20, y + 5);
    doc.text('Date & Time:', 20, y + 15);
    doc.text('Customer:', 20, y + 25);
    doc.text('Status:', pageWidth / 2 + 10, y + 5);
    doc.text('Payment Time:', pageWidth / 2 + 10, y + 15);
    doc.text('Payment Method:', pageWidth / 2 + 10, y + 25);
    
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNo || invoice.number || 'N/A', 55, y + 5);
    doc.text(formatDateTime(invoice.createdAt), 55, y + 15);
    doc.text(subscription?.customer?.name || user?.name || 'Customer', 55, y + 25);
    
    // Status with color
    if (invoice.status === 'PAID') {
      doc.setTextColor(22, 163, 74);
    } else if (invoice.status === 'CONFIRMED') {
      doc.setTextColor(217, 119, 6);
    } else {
      doc.setTextColor(107, 114, 128);
    }
    doc.text(invoice.status, pageWidth / 2 + 43, y + 5);
    doc.setTextColor(0, 0, 0);
    
    // Payment time
    doc.text(invoice.paidAt ? formatDateTime(invoice.paidAt) : 'Not paid', pageWidth / 2 + 43, y + 15);
    
    // Payment method
    const paymentMethodText = invoice.paymentMethod === 'upi' ? 'UPI' : 
                              invoice.paymentMethod === 'netbanking' ? 'Net Banking' : 
                              invoice.paymentMethod === 'card' ? 'Credit Card' : 'Card';
    doc.text(paymentMethodText, pageWidth / 2 + 50, y + 25);

    y += 45;

    // Billing & Shipping Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text('BILLING DETAILS', 20, y);
    doc.text('SHIPPING DETAILS', pageWidth / 2 + 10, y);
    doc.setTextColor(0, 0, 0);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Billing
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || 'Customer', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.email || 'customer@example.com', 20, y + 5);
    doc.text('123 Business Street', 20, y + 10);
    doc.text('Chennai, Tamil Nadu 600001', 20, y + 15);
    doc.text('India', 20, y + 20);
    doc.text('GSTIN: 33AABCU9603R1ZM', 20, y + 28);

    // Shipping
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || 'Customer', pageWidth / 2 + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Business Street', pageWidth / 2 + 10, y + 5);
    doc.text('Chennai, Tamil Nadu 600001', pageWidth / 2 + 10, y + 10);
    doc.text('India', pageWidth / 2 + 10, y + 15);
    doc.text('Phone: +91 98765 43210', pageWidth / 2 + 10, y + 20);

    y += 45;

    // Product Details Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text('PRODUCT & SUBSCRIPTION DETAILS', 20, y);
    doc.setTextColor(0, 0, 0);

    y += 8;

    // Table Header
    doc.setFillColor(124, 58, 237);
    doc.rect(14, y - 4, pageWidth - 28, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, y + 3);
    doc.text('Qty', 110, y + 3);
    doc.text('Unit Price', 130, y + 3);
    doc.text('Amount', 170, y + 3);

    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // Table Row
    doc.setFillColor(249, 250, 251);
    doc.rect(14, y - 4, pageWidth - 28, 20, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(product?.name || 'N/A', 20, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Plan: ${plan?.name || 'N/A'}`, 20, y + 9);
    doc.text(`Type: ${product?.type || 'N/A'} | Billing: ${plan?.billingPeriod || 'N/A'}`, 20, y + 14);
    
    doc.setFontSize(9);
    doc.text('1', 115, y + 8);
    doc.text(formatCurrency(breakdown.basePrice), 130, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(breakdown.basePrice), 170, y + 8);

    y += 30;

    // Subscription Period
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text('SUBSCRIPTION PERIOD', 20, y);
    doc.setTextColor(0, 0, 0);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subscription Number: ${subscription?.subscriptionNo || 'N/A'}`, 20, y);
    doc.text(`Start Date: ${subscription ? formatDate(subscription.startDate) : 'N/A'}`, 20, y + 6);
    doc.text(`End Date: ${subscription ? formatDate(subscription.expirationDate) : 'N/A'}`, 100, y + 6);

    y += 20;

    // Price Breakdown
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text('PRICE BREAKDOWN', 20, y);
    doc.setTextColor(0, 0, 0);

    y += 10;
    doc.setFontSize(9);

    // Price breakdown box
    const boxX = pageWidth - 100;
    const hasDiscount = breakdown.discountAmount > 0;
    const boxHeight = hasDiscount ? 70 : 50; // Smaller box if no discount
    
    doc.setFillColor(249, 250, 251);
    doc.rect(boxX - 10, y - 5, 90, boxHeight, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(boxX - 10, y - 5, 90, boxHeight, 'S');

    doc.setFont('helvetica', 'normal');
    let lineY = y + 3;
    
    doc.text('Subtotal:', boxX, lineY);
    doc.text(formatCurrency(breakdown.basePrice), boxX + 70, lineY, { align: 'right' });
    lineY += 9;

    // Only show discount line if discount was applied
    if (hasDiscount) {
      doc.setTextColor(22, 163, 74);
      if (breakdown.couponCode) {
        doc.text(`Coupon (${breakdown.couponCode}):`, boxX, lineY);
      } else if (breakdown.discountPercent > 0) {
        doc.text(`Discount (${breakdown.discountPercent}%):`, boxX, lineY);
      } else {
        doc.text('Discount:', boxX, lineY);
      }
      doc.text(`-${formatCurrency(breakdown.discountAmount)}`, boxX + 70, lineY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      lineY += 5;

      doc.setDrawColor(200, 200, 200);
      doc.line(boxX, lineY, boxX + 70, lineY);
      lineY += 7;

      doc.text('After Discount:', boxX, lineY);
      doc.text(formatCurrency(breakdown.priceAfterDiscount), boxX + 70, lineY, { align: 'right' });
      lineY += 9;
    }

    doc.text('Platform Fee:', boxX, lineY);
    doc.text(formatCurrency(breakdown.platformFee), boxX + 70, lineY, { align: 'right' });
    lineY += 9;

    doc.text(`GST (${breakdown.gstPercent}%):`, boxX, lineY);
    doc.text(formatCurrency(breakdown.gstAmount), boxX + 70, lineY, { align: 'right' });
    lineY += 6;

    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(boxX, lineY, boxX + 70, lineY);
    lineY += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', boxX, lineY);
    doc.setTextColor(124, 58, 237);
    doc.text(formatCurrency(breakdown.totalAmount), boxX + 70, lineY, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Savings box on left - only show if discount was applied
    if (hasDiscount) {
      doc.setFillColor(220, 252, 231);
      doc.rect(20, y, 70, 25, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.rect(20, y, 70, 25, 'S');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(22, 101, 52);
      doc.text('You Saved', 55, y + 8, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(breakdown.discountAmount), 55, y + 19, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    y += 85;

    // Terms & Conditions
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('1. This is a computer-generated invoice and does not require a signature.', 20, y + 6);
    doc.text('2. GST is calculated as per Indian tax regulations.', 20, y + 11);
    doc.text('3. For queries, contact support@subsmanager.com', 20, y + 16);

    // Footer
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 280, pageWidth, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    centerText('Thank you for your business!', 288);
    doc.setFontSize(7);
    centerText('SubsManager | www.subsmanager.com | support@subsmanager.com', 294);

    // Save PDF
    doc.save(`${invoice.invoiceNo || invoice.number || 'invoice'}.pdf`);
  };

  return (
    <Layout type="portal">
      <PageHeader title="My Invoices" />

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="stat-card-value">{invoices.length}</p>
                <p className="stat-card-label">Total Invoices</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Receipt className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="stat-card-value text-blue-500">₹{totalAmount.toLocaleString('en-IN')}</p>
                <p className="stat-card-label">Total Amount</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="stat-card-value text-green-500">₹{paidAmount.toLocaleString('en-IN')}</p>
                <p className="stat-card-label">Paid</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="stat-card-value text-amber-500">₹{(totalAmount - paidAmount).toLocaleString('en-IN')}</p>
                <p className="stat-card-label">Outstanding ({pendingCount})</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {invoices.length > 0 && (
        <div className="mb-6">
          <SearchFilter
            data={enrichedInvoices}
            searchFields={['number', 'planName', 'productName']}
            filterConfig={filterConfig}
            onFilterChange={handleFilterChange}
            placeholder="Search by invoice number, plan or product..."
          />
        </div>
      )}

      {/* Invoices List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : invoices.length === 0 ? (
        <NoInvoices />
      ) : filteredInvoices.length === 0 ? (
        <NoSearchResults onClear={() => setFilteredInvoices(invoices)} />
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const subscription = invoice.subscription;
            const plan = subscription?.plan;
            const product = subscription?.lines?.[0]?.product;
            const canPay = invoice.status === InvoiceStatus.CONFIRMED;

            return (
              <div
                key={invoice.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        invoice.status === InvoiceStatus.PAID
                          ? 'bg-green-500/10'
                          : invoice.status === InvoiceStatus.CONFIRMED
                          ? 'bg-amber-500/10'
                          : 'bg-muted'
                      }`}
                    >
                      <Receipt
                        className={`w-6 h-6 ${
                          invoice.status === InvoiceStatus.PAID
                            ? 'text-green-500'
                            : invoice.status === InvoiceStatus.CONFIRMED
                            ? 'text-amber-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{invoice.invoiceNo}</h3>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan?.name || 'Unknown Plan'}
                        {product && ` • ${product.name}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Subscription: {subscription?.subscriptionNo || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">₹{Number(invoice.total || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(invoice.createdAt)}
                    </p>
                    {invoice.paidAt && invoice.status === InvoiceStatus.PAID && (
                      <p className="text-xs text-green-600 mt-1">
                        Paid at {formatTime(invoice.paidAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    {invoice.status === InvoiceStatus.PAID && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle size={16} />
                        Payment received {invoice.paidAt && `on ${formatDateTime(invoice.paidAt)}`}
                      </span>
                    )}
                    {invoice.status === InvoiceStatus.CONFIRMED && (
                      <span className="flex items-center gap-1 text-sm text-amber-600">
                        <Clock size={16} />
                        Awaiting payment
                      </span>
                    )}
                    {invoice.status === InvoiceStatus.DRAFT && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText size={16} />
                        Draft invoice
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <FileText size={14} className="mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </Button>
                    {canPay && (
                      <Button size="sm" className="h-8 bg-primary hover:bg-primary/90">
                        <CreditCard size={14} className="mr-1" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice View Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Invoice Details
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (() => {
            const subscription = selectedInvoice.subscription;
            const plan = subscription?.plan;
            const product = subscription?.lines?.[0]?.product;
            const breakdown = calculateBreakdown(selectedInvoice);

            return (
              <div className="mt-4">
                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">TAX INVOICE</h2>
                      <StatusBadge status={selectedInvoice.status} />
                      {subscription?.customer?.name && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Customer: <span className="font-medium text-foreground">{subscription.customer.name}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Invoice Number</p>
                      <p className="font-mono font-semibold text-foreground">{selectedInvoice.invoiceNo}</p>
                      <p className="text-sm text-muted-foreground mt-2">Date & Time</p>
                      <p className="font-medium text-foreground">{formatDateTime(selectedInvoice.createdAt)}</p>
                      {selectedInvoice.paidAt && selectedInvoice.status === InvoiceStatus.PAID && (
                        <>
                          <p className="text-sm text-muted-foreground mt-2">Payment Time</p>
                          <p className="font-medium text-green-600">{formatDateTime(selectedInvoice.paidAt)}</p>
                        </>
                      )}
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
                      <p className="font-medium text-foreground">{subscription?.customer?.name || user?.name || 'Customer Name'}</p>
                      <p>{subscription?.customer?.email || user?.email || 'customer@example.com'}</p>
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
                      <p className="font-medium text-foreground">{subscription?.customer?.name || user?.name || 'Customer Name'}</p>
                      <p>123 Business Street</p>
                      <p>Chennai, Tamil Nadu 600001</p>
                      <p>India</p>
                      <p>Phone: +91 98765 43210</p>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
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
                              <p className="font-medium text-foreground">{product?.name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{plan?.name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Type: {product?.type || 'N/A'} | Billing: {plan?.billingPeriod || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 text-center">1</td>
                          <td className="py-4 text-right">{formatCurrencyDisplay(breakdown.basePrice)}</td>
                          <td className="py-4 text-right font-medium">{formatCurrencyDisplay(breakdown.basePrice)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subscription Period */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className={`rounded-lg p-4 text-center ${
                    selectedInvoice.status === InvoiceStatus.PAID 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-amber-50 dark:bg-amber-900/20'
                  }`}>
                    <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                    <p className={`font-semibold ${
                      selectedInvoice.status === InvoiceStatus.PAID ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {selectedInvoice.status}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="font-semibold text-blue-600">
                      {subscription ? formatDate(subscription.startDate) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="font-semibold text-purple-600">
                      {subscription ? formatDate(subscription.expirationDate) : 'N/A'}
                    </p>
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
                      <span className="text-foreground">{formatCurrencyDisplay(breakdown.basePrice)}</span>
                    </div>
                    {/* Only show discount if applied */}
                    {breakdown.discountAmount > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600 flex items-center gap-1">
                            {breakdown.couponCode ? (
                              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                                {breakdown.couponCode}
                              </span>
                            ) : breakdown.discountPercent > 0 ? (
                              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                                -{breakdown.discountPercent}%
                              </span>
                            ) : null}
                            Discount Applied
                          </span>
                          <span className="text-green-600">-{formatCurrencyDisplay(breakdown.discountAmount)}</span>
                        </div>
                        <div className="border-t border-dashed border-border pt-3 flex justify-between text-sm">
                          <span className="text-muted-foreground">Price After Discount</span>
                          <span className="text-foreground font-medium">{formatCurrencyDisplay(breakdown.priceAfterDiscount)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="text-foreground">{formatCurrencyDisplay(breakdown.platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        GST ({breakdown.gstPercent}%)
                        <span className="text-xs ml-1">(CGST 9% + SGST 9%)</span>
                      </span>
                      <span className="text-foreground">{formatCurrencyDisplay(breakdown.gstAmount)}</span>
                    </div>
                    <div className="border-t-2 border-border pt-3 flex justify-between">
                      <span className="font-semibold text-foreground">Total Amount</span>
                      <span className="text-xl font-bold text-primary">{formatCurrencyDisplay(breakdown.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Savings Summary - Only show when discount was applied */}
                {breakdown.discountAmount > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Original Price</p>
                        <p className="text-lg line-through text-muted-foreground">{formatCurrencyDisplay(breakdown.basePrice)}</p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm text-green-600 font-medium">You Saved</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrencyDisplay(breakdown.discountAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrencyDisplay(breakdown.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsInvoiceModalOpen(false)}
                  >
                    <X size={16} className="mr-2" />
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                  >
                    <Download size={16} className="mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Invoice Status Guide */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3">Invoice Status Guide</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <StatusBadge status={InvoiceStatus.DRAFT} />
            <span className="text-xs text-muted-foreground">Being prepared</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={InvoiceStatus.CONFIRMED} />
            <span className="text-xs text-muted-foreground">Ready for payment</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={InvoiceStatus.PAID} />
            <span className="text-xs text-muted-foreground">Payment complete</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
