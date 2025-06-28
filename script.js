let masterKey = "";

function askMasterPassword() {
    while (!masterKey) {
        masterKey = prompt("Enter your master password to access PassX:");
    }
}

function encrypt(text) {
    return CryptoJS.AES.encrypt(text, masterKey).toString();
}

function decrypt(cipherText) {
    try {
        return CryptoJS.AES.decrypt(cipherText, masterKey).toString(CryptoJS.enc.Utf8);
    } catch {
        return "Decryption failed";
    }
}

function maskPassword(pass) {
    return "*".repeat(pass.length);
}

function copyText(txt) {
    navigator.clipboard.writeText(txt).then(() => {
        document.getElementById("alert").style.display = "inline";
        setTimeout(() => {
            document.getElementById("alert").style.display = "none";
        }, 2000);
    }, () => {
        alert("Clipboard copying failed");
    });
}

const deletePassword = (website) => {
    let data = localStorage.getItem("passwords");
    let arr = JSON.parse(data);
    let updated = arr.filter(e => e.website !== website);
    localStorage.setItem("passwords", JSON.stringify(updated));
    showPasswords();
};

const showPasswords = () => {
    let tb = document.getElementById("passwordTable");
    let data = localStorage.getItem("passwords");

    if (!data || JSON.parse(data).length === 0) {
        tb.innerHTML = "<tr><td colspan='4'>No data to show.</td></tr>";
        return;
    }

    tb.innerHTML = `<tr>
        <th>Website</th>
        <th>Username</th>
        <th>Password</th>
        <th>Delete</th>
    </tr>`;

    let arr = JSON.parse(data);
    arr.forEach(entry => {
        const decryptedPassword = decrypt(entry.password);
        tb.innerHTML += `<tr>
            <td>${entry.website} <img onclick="copyText('${entry.website}')" src="./copy.svg" alt="Copy"></td>
            <td>${entry.username} <img onclick="copyText('${entry.username}')" src="./copy.svg" alt="Copy"></td>
            <td>${maskPassword(decryptedPassword)} <img onclick="copyText('${decryptedPassword}')" src="./copy.svg" alt="Copy"></td>
            <td><button class="btnsm" onclick="deletePassword('${entry.website}')">Delete</button></td>
        </tr>`;
    });

    website.value = "";
    username.value = "";
    password.value = "";
};

document.addEventListener("DOMContentLoaded", () => {
    askMasterPassword();
    showPasswords();

    document.querySelector(".btn").addEventListener("click", (e) => {
        e.preventDefault();

        let websiteVal = website.value.trim();
        let usernameVal = username.value.trim();
        let passwordVal = password.value.trim();

        if (!websiteVal || !usernameVal || !passwordVal) {
            alert("Please fill in all fields.");
            return;
        }

        let stored = localStorage.getItem("passwords");
        let entries = stored ? JSON.parse(stored) : [];

        if (entries.some(e => e.website === websiteVal)) {
            alert("Password for this website already exists.");
            return;
        }

        entries.push({
            website: websiteVal,
            username: usernameVal,
            password: encrypt(passwordVal)
        });

        localStorage.setItem("passwords", JSON.stringify(entries));
        alert("Password saved!");
        showPasswords();
    });
});
