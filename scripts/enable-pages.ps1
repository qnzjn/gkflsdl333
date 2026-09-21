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

# 1. 저장소를 Public으로 전환 (GitHub Pages 무료 호스팅 지원 목적)
$patchBody = @{ private = $false } | ConvertTo-Json
$patchRes = curl.exe -s -X PATCH -H "Authorization: token $token" -H "User-Agent: AutoDeploy" -H "Accept: application/vnd.github+json" -d $patchBody https://api.github.com/repos/qnzjn/gkflsdl333
$isPrivate = ($patchRes | ConvertFrom-Json).private
Write-Host "Repository is now Public (Private: $isPrivate)"

# 2. GitHub Pages 활성화
$pagesBody = @{ build_type = "workflow" } | ConvertTo-Json
$res = curl.exe -s -X POST -H "Authorization: token $token" -H "User-Agent: AutoDeploy" -H "Accept: application/vnd.github+json" -d $pagesBody https://api.github.com/repos/qnzjn/gkflsdl333/pages
Write-Host "Pages Enable response:" $res

# 3. 배포 워크플로우 상태 확인
$actionsRes = curl.exe -s -H "Authorization: token $token" -H "User-Agent: AutoDeploy" https://api.github.com/repos/qnzjn/gkflsdl333/actions/runs
$runs = ($actionsRes | ConvertFrom-Json).workflow_runs

Write-Host "Action Runs status:"
foreach ($r in $runs) {
    Write-Host "Workflow:" $r.name "| Status:" $r.status "| Conclusion:" $r.conclusion "| URL:" $r.html_url
}
