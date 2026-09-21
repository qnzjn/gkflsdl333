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

Write-Host "Token retrieved: Length" $token.Length

# 1. 깃허브 API로 현재 사용자 확인
$userJson = curl.exe -s -H "Authorization: token $token" -H "User-Agent: AutoDeploy" https://api.github.com/user | ConvertFrom-Json
Write-Host "Authenticated GitHub User:" $userJson.login

# 2. qnzjn/gkflsdl333 저장소가 있는지 확인, 없으면 API로 자동 생성!
$repoName = "gkflsdl333"
$checkRepo = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: token $token" -H "User-Agent: AutoDeploy" "https://api.github.com/repos/$($userJson.login)/$repoName"

Write-Host "Repo check HTTP code:" $checkRepo

if ($checkRepo -eq "404") {
    Write-Host "Creating repository $repoName automatically via GitHub API..."
    $createBody = @{
        name = $repoName
        description = "생활정보 실시간 뉴스 매거진 웹 앱"
        private = $false
        auto_init = $false
    } | ConvertTo-Json
    
    $createRes = curl.exe -s -X POST -H "Authorization: token $token" -H "User-Agent: AutoDeploy" -H "Content-Type: application/json" -d $createBody https://api.github.com/user/repos
    Write-Host "Create response received."
} else {
    Write-Host "Repository $repoName already exists."
}

# 3. 토큰을 포함한 remote url로 push 자동 실행!
$remoteWithToken = "https://x-access-token:$token@github.com/$($userJson.login)/$repoName.git"
git remote set-url origin $remoteWithToken
Write-Host "Pushing to $repoName with authentication token..."
$pushResult = git push -u origin main --force 2>&1
Write-Host $pushResult

# 4. 보안을 위해 remote url을 다시 토큰 없는 깔끔한 url로 복원
git remote set-url origin "https://github.com/$($userJson.login)/$repoName.git"
Write-Host "Remote URL restored to clean https."
