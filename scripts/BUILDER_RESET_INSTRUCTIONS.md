# Builder.io Extension Reset Instructions

0. **Remove Builder.io packages**  
   In the frontend directory run:  
   ```powershell
   npm uninstall @builder.io/react @builder.io/cli @builder.io/sdk
   ```  

1. **Revert Builder integration files to the original state**  
   Open a terminal in the project root and run:  
   ```powershell
   git restore frontend/builder.config.json \
     frontend/src/config/builder.ts \
     .vscode/settings.json \
     vite.config.ts
   ```
   This will undo all local changes to those files so you’re back to the pre-Builder setup.

2. **Run CLI logout/login script**
   ```powershell
   .\scripts\reset-builder-auth.ps1
   ```

3. **Clear stored Builder credentials in the extension**  
   - Open a Builder.io panel or page in VS Code (e.g. your `/builder` or `/builder-test` route webview).  
   - Open its Webview devtools via the Command Palette: **Developer: Toggle Webview Developer Tools**.  
   - In DevTools, go to **Application** ➔ **Local Storage**, select the webview origin (`vscode-webview://...`), and delete any keys related to Builder (e.g. `authToken`, `apiKey`).  
   - Still in **Application**, clear **IndexedDB** entries for Builder.  
   - Close the devtools and reload the webview (right-click inside and **Reload Webview**).

4. **Clear extension storage in VS Code**
   - From the Command Palette, choose **Developer: Toggle Developer Tools**.
   - In the DevTools window, go to the **Application** tab.
   - Under **Storage**, clear **Local Storage** and **IndexedDB** entries related to `builder.io`.
   - Reload the extension/webview with **Developer: Reload Window**.

5. **Update Builder.io extension project settings**  
   - Open VS Code **Settings** (Ctrl+,) and search for `Builder`.  
   - Under **Builder: Local Edit Url**, enter `http://localhost:5173` (or your dev server port).  
   - Under **Builder: Host**, enter the new host value for your Builder.io project (e.g. `abcdef1234567890`).  
   - Under **Builder: Space Id**, enter your new `spaceId` (e.g. `abcd1234efgh5678ijkl9012mnop3456`).  
   - Save settings and reload VS Code (`Developer: Reload Window`).

6. **Sign in with your new Builder.io account**  
   - Open the Command Palette again.  
   - Run `Builder: Sign In` (or `Builder.io: Sign In`).

7. **Verify login**  
   - You should now see your new account email in the Builder panel or extension status.

*Tip:* If the external browser URL still contains old parameters, manually remove `host` and `spaceId` query strings before loading, or use the updated settings above to override them.*

If the extension still loads endlessly in a browser window, make sure your preview URL matches your running dev server port (e.g. `http://localhost:5173`).