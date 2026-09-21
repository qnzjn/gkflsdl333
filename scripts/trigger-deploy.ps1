Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class CredManager {
    [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

    [DllImport("advapi32.dll", EntryPoint = "CredFree", SetLastError = true)]
    public static extern void CredFree(IntPtr credentialPtr);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static string GetPassword(string target) {
        IntPtr credPtr;
        if (CredRead(target, 1, 0, out credPtr)) {
            var cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            byte[] bytes = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
            CredFree(credPtr);
            return Encoding.Unicode.GetString(bytes);
        }
        return null;
    }
}
"@

$token = [CredManager]::GetPassword("git:https://x-access-token@github.com")
if (!$token) {
    $token = [CredManager]::GetPassword("git:https://github.com")
}

Write-Host "Triggering workflow dispatch..."
$dispatchBody = @{ ref = "main" } | ConvertTo-Json
$dRes = curl.exe -s -X POST -H "Authorization: token $token" -H "User-Agent: AutoDeploy" -H "Accept: application/vnd.github+json" -d $dispatchBody https://api.github.com/repos/qnzjn/gkflsdl333/actions/workflows/deploy.yml/dispatches
Write-Host "Dispatch sent."

Start-Sleep -Seconds 5

$actionsRes = curl.exe -s -H "Authorization: token $token" -H "User-Agent: AutoDeploy" https://api.github.com/repos/qnzjn/gkflsdl333/actions/runs
$latestRun = ($actionsRes | ConvertFrom-Json).workflow_runs[0]

Write-Host "Latest Run:" $latestRun.name "| Status:" $latestRun.status "| HTML:" $latestRun.html_url
