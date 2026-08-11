package io.cvvault.app;

import android.app.Dialog;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private SwipeRefreshLayout swipeRefreshLayout;
    private ValueCallback<Uri[]> mFilePathCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 10001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(true);

            String defaultUserAgent = settings.getUserAgentString();
            if (defaultUserAgent != null) {
                String cleanUserAgent = defaultUserAgent.replace("; wv", "");
                settings.setUserAgentString(cleanUserAgent);
            }

            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            // Get original Capacitor WebChromeClient to preserve native plugin callbacks
            WebChromeClient originalWebChromeClient = getBridge() != null ? getBridge().getWebChromeClient() : null;

            // Set custom WebChromeClient that supports both OAuth popups AND native file chooser sheets
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                    WebView popupWebView = new WebView(MainActivity.this);
                    WebSettings popupSettings = popupWebView.getSettings();
                    popupSettings.setJavaScriptEnabled(true);
                    popupSettings.setDomStorageEnabled(true);
                    popupSettings.setDatabaseEnabled(true);
                    popupSettings.setJavaScriptCanOpenWindowsAutomatically(true);

                    if (defaultUserAgent != null) {
                        String cleanUserAgent = defaultUserAgent.replace("; wv", "");
                        popupSettings.setUserAgentString(cleanUserAgent);
                    }

                    CookieManager.getInstance().setAcceptThirdPartyCookies(popupWebView, true);

                    Dialog popupDialog = new Dialog(MainActivity.this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
                    popupDialog.setContentView(popupWebView);
                    popupDialog.show();

                    popupWebView.setWebChromeClient(new WebChromeClient() {
                        @Override
                        public void onCloseWindow(WebView window) {
                            try {
                                popupDialog.dismiss();
                            } catch (Exception ignored) {}
                            window.destroy();
                        }
                    });

                    popupWebView.setWebViewClient(new WebViewClient() {
                        @Override
                        public boolean shouldOverrideUrlLoading(WebView view, String url) {
                            return false;
                        }
                    });

                    WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                    transport.setWebView(popupWebView);
                    resultMsg.sendToTarget();
                    return true;
                }

                @Override
                public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                    // 1. Delegate to Capacitor bridge client if available
                    if (originalWebChromeClient != null) {
                        try {
                            boolean handled = originalWebChromeClient.onShowFileChooser(webView, filePathCallback, fileChooserParams);
                            if (handled) return true;
                        } catch (Exception ignored) {}
                    }

                    // 2. Native Android Intent File Picker fallback
                    if (mFilePathCallback != null) {
                        mFilePathCallback.onReceiveValue(null);
                        mFilePathCallback = null;
                    }
                    mFilePathCallback = filePathCallback;

                    try {
                        Intent intent = null;
                        if (fileChooserParams != null) {
                            intent = fileChooserParams.createIntent();
                        }
                        if (intent == null) {
                            intent = new Intent(Intent.ACTION_GET_CONTENT);
                            intent.addCategory(Intent.CATEGORY_OPENABLE);
                            intent.setType("*/*");
                        }
                        startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                        return true;
                    } catch (Exception e) {
                        if (mFilePathCallback != null) {
                            mFilePathCallback.onReceiveValue(null);
                            mFilePathCallback = null;
                        }
                        return false;
                    }
                }
            });

            webView.post(() -> {
                ViewParent parent = webView.getParent();
                if (parent instanceof ViewGroup) {
                    ViewGroup viewGroup = (ViewGroup) parent;
                    swipeRefreshLayout = new SwipeRefreshLayout(MainActivity.this);

                    // Allow pull-to-refresh only when user is at top of page (scrollY == 0)
                    swipeRefreshLayout.setOnChildScrollUpCallback((parentLayout, child) -> webView.getScrollY() > 0);

                    // Pull-to-refresh action: reload current page in WebView
                    swipeRefreshLayout.setOnRefreshListener(() -> {
                        webView.reload();
                        new Handler(Looper.getMainLooper()).postDelayed(() -> {
                            if (swipeRefreshLayout != null) {
                                swipeRefreshLayout.setRefreshing(false);
                            }
                        }, 1500);
                    });

                    swipeRefreshLayout.setColorSchemeColors(0xFF3482BE);

                    viewGroup.removeView(webView);
                    swipeRefreshLayout.addView(webView, new ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    ));
                    viewGroup.addView(swipeRefreshLayout, new ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    ));
                }
            });
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (mFilePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                String dataString = data.getDataString();
                ClipData clipData = data.getClipData();
                if (clipData != null) {
                    results = new Uri[clipData.getItemCount()];
                    for (int i = 0; i < clipData.getItemCount(); i++) {
                        results[i] = clipData.getItemAt(i).getUri();
                    }
                } else if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
        }
    }
}

