%define name scoped-my-cool-api
%define version 1.1.1
%define release 1
%define buildroot %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)

Name: %{name}
Version: %{version}
Release: %{release}
Summary: scoped-my-cool-api

Group: Installation Script
License: MIT
Source: %{name}.tar.gz
BuildRoot: %{buildroot}
Requires: nodejs
BuildRequires: nodejs
AutoReqProv: no

%description
My Cool API

%prep
%setup -q -c -n %{name}

%build
npm prune --production
npm rebuild

%pre
getent group scoped-my-cool-api >/dev/null || groupadd -r scoped-my-cool-api
getent passwd scoped-my-cool-api >/dev/null || useradd -r -g scoped-my-cool-api -G scoped-my-cool-api -d / -s /sbin/nologin -c "scoped-my-cool-api" scoped-my-cool-api

%install
mkdir -p %{buildroot}/usr/lib/scoped-my-cool-api
cp -r ./ %{buildroot}/usr/lib/scoped-my-cool-api
mkdir -p %{buildroot}/var/log/scoped-my-cool-api

%post
systemctl enable /usr/lib/scoped-my-cool-api/scoped-my-cool-api.service

%clean
rm -rf %{buildroot}

%files
%defattr(644, scoped-my-cool-api, scoped-my-cool-api, 755)
/usr/lib/scoped-my-cool-api
/var/log/scoped-my-cool-api
